const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Formato não suportado. Use PDF, JPG ou PNG.'));
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT = `Você é um assistente especializado em leitura de extratos bancários e faturas brasileiros.
Analise o documento fornecido e extraia TODAS as transações financeiras encontradas.

Para cada transação, identifique:
- description: descrição original do lançamento (texto exato do extrato)
- amount: valor numérico positivo (sem símbolo de moeda)
- type: "income" para créditos/entradas, "expense" para débitos/saídas
- date: data no formato YYYY-MM-DD (se não houver ano, use o ano atual)
- category: uma das categorias abaixo, escolha a mais adequada
- confidence: "high", "medium" ou "low" (sua confiança na categorização)

Categorias disponíveis para income: Salário, Freelance, Outros rendimentos
Categorias disponíveis para expense: Alimentação, Supermercado, Transporte, Moradia, Internet/Tel, Saúde, Educação, Lazer, Manutenção carro, Manutenção casa, Cartão de crédito, Outros

Regras de categorização:
- PIX/TED/DOC recebido → Outros rendimentos (a menos que seja salário explícito)
- Salário/Pagamento folha → Salário
- iFood, Rappi, Uber Eats, restaurante, lanchonete → Alimentação
- Supermercado, mercado, atacado → Supermercado
- Uber, 99, combustível, posto, estacionamento → Transporte
- Aluguel, condomínio, IPTU → Moradia
- Claro, Vivo, Tim, NET, internet → Internet/Tel
- Farmácia, hospital, plano de saúde, médico → Saúde
- Escola, faculdade, curso, livraria → Educação
- Cinema, streaming, bar, balada → Lazer
- Mecânica, peças de carro, borracharia → Manutenção carro
- Material de construção, reforma, eletricista → Manutenção casa
- Fatura cartão, pagamento cartão → Cartão de crédito

Responda SOMENTE com um JSON válido, sem texto adicional, sem markdown, sem explicações:
{
  "transactions": [
    {
      "description": "texto original",
      "amount": 150.00,
      "type": "expense",
      "date": "2025-05-01",
      "category": "Alimentação",
      "confidence": "high"
    }
  ],
  "summary": {
    "totalIncome": 0,
    "totalExpense": 0,
    "period": "mês/ano detectado ou null",
    "bankName": "nome do banco detectado ou null",
    "documentType": "extrato bancário | fatura cartão | outro"
  }
}`;

router.post('/upload', protect, upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  const filePath = req.file.path;
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      PROMPT,
    ]);
    const rawText = result.response.text().trim();
    let parsed;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Resposta inválida da IA. Tente novamente.');
      parsed = JSON.parse(match[0]);
    }
    res.json({ transactions: parsed.transactions || [], summary: parsed.summary || {} });
  } catch (err) {
    console.error('Erro no import:', err.message);
    res.status(500).json({ message: err.message || 'Erro ao processar documento.' });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

router.post('/confirm', protect, async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0)
      return res.status(400).json({ message: 'Nenhuma transação para salvar.' });
    const toInsert = transactions.map((t) => ({
      user: req.user._id,
      name: t.description,
      amount: parseFloat(t.amount),
      type: t.type,
      category: t.category,
      date: new Date(t.date),
      notes: `Importado automaticamente (confiança: ${t.confidence || 'n/a'})`,
    }));
    const saved = await Transaction.insertMany(toInsert);
    res.status(201).json({ saved: saved.length, message: `${saved.length} transações importadas com sucesso.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
