const express = require('express');
const router = express.Router();
const SavingsBox = require('../models/SavingsBox');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/savings  →  lista todas as caixinhas
router.get('/', async (req, res) => {
  try {
    const boxes = await SavingsBox.find({ user: req.user._id, active: true }).sort({ createdAt: -1 });
    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/savings/:id  →  detalhes com histórico
router.get('/:id', async (req, res) => {
  try {
    const box = await SavingsBox.findOne({ _id: req.params.id, user: req.user._id });
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/savings  →  criar caixinha
router.post('/', async (req, res) => {
  try {
    const { name, goal, objective, color, emoji } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const box = await SavingsBox.create({
      user: req.user._id, name, goal, objective,
      color: color || '#1D9E75',
      emoji: emoji || '🏦',
    });
    res.status(201).json(box);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/savings/:id/deposit  →  depositar
router.post('/:id/deposit', async (req, res) => {
  try {
    const { amount, date, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valor inválido.' });

    const box = await SavingsBox.findOne({ _id: req.params.id, user: req.user._id });
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });

    box.currentBalance += parseFloat(amount);
    box.totalDeposited += parseFloat(amount);
    box.movements.push({
      type: 'deposit',
      amount: parseFloat(amount),
      date: date || new Date(),
      notes: notes || '',
      balanceAfter: box.currentBalance,
    });

    await box.save();
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/savings/:id/withdrawal  →  retirar
router.post('/:id/withdrawal', async (req, res) => {
  try {
    const { amount, date, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valor inválido.' });

    const box = await SavingsBox.findOne({ _id: req.params.id, user: req.user._id });
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });
    if (box.currentBalance < amount) return res.status(400).json({ message: 'Saldo insuficiente.' });

    box.currentBalance -= parseFloat(amount);
    box.movements.push({
      type: 'withdrawal',
      amount: parseFloat(amount),
      date: date || new Date(),
      notes: notes || '',
      balanceAfter: box.currentBalance,
    });

    await box.save();
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/savings/:id/yield  →  registrar rendimento
router.post('/:id/yield', async (req, res) => {
  try {
    const { amount, date, notes } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valor inválido.' });

    const box = await SavingsBox.findOne({ _id: req.params.id, user: req.user._id });
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });

    box.currentBalance += parseFloat(amount);
    box.totalYield += parseFloat(amount);
    box.movements.push({
      type: 'yield',
      amount: parseFloat(amount),
      date: date || new Date(),
      notes: notes || 'Rendimento',
      balanceAfter: box.currentBalance,
    });

    await box.save();
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/savings/:id  →  editar caixinha
router.put('/:id', async (req, res) => {
  try {
    const box = await SavingsBox.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { name: req.body.name, goal: req.body.goal, objective: req.body.objective, color: req.body.color, emoji: req.body.emoji } },
      { new: true }
    );
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });
    res.json(box);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/savings/:id  →  arquivar caixinha
router.delete('/:id', async (req, res) => {
  try {
    const box = await SavingsBox.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { active: false },
      { new: true }
    );
    if (!box) return res.status(404).json({ message: 'Caixinha não encontrada.' });
    res.json({ message: 'Caixinha arquivada.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;