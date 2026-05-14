import { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, CAT_COLORS, CAT_ICONS, CATEGORIES } from '../utils/formatters';
import api from '../utils/api';

const STEPS = { UPLOAD: 'upload', PROCESSING: 'processing', REVIEW: 'review', DONE: 'done' };

export default function Import() {
  const { fetchSummary } = useFinance();
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [savedCount, setSavedCount] = useState(0);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) { setError('Formato não suportado. Use PDF, JPG ou PNG.'); return; }
    if (f.size > 20 * 1024 * 1024) { setError('Arquivo muito grande. Máximo 20MB.'); return; }
    setError(''); setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processDocument = async () => {
    if (!file) return;
    setStep(STEPS.PROCESSING); setError('');
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await api.post('/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedData(data.summary);
      const txs = data.transactions.map((t, i) => ({ ...t, _tempId: i }));
      setTransactions(txs);
      setSelected(new Set(txs.map((t) => t._tempId))); // seleciona todas por padrão
      setStep(STEPS.REVIEW);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar documento. Tente novamente.');
      setStep(STEPS.UPLOAD);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateTransaction = (id, field, value) => {
    setTransactions((prev) => prev.map((t) => t._tempId === id ? { ...t, [field]: value } : t));
  };

  const confirmImport = async () => {
    const toSave = transactions.filter((t) => selected.has(t._tempId));
    if (toSave.length === 0) return;
    try {
      const { data } = await api.post('/import/confirm', { transactions: toSave });
      setSavedCount(data.saved);
      setStep(STEPS.DONE);
      fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar transações.');
    }
  };

  const reset = () => {
    setStep(STEPS.UPLOAD); setFile(null); setError('');
    setExtractedData(null); setTransactions([]); setSelected(new Set());
  };

  const confidenceColor = (c) => ({ high: 'badge-green', medium: 'badge-amber', low: 'badge-red' }[c] || 'badge-gray');
  const confidenceLabel = (c) => ({ high: '✓ Alta', medium: '~ Média', low: '? Baixa' }[c] || c);

  // ── UPLOAD ──
  if (step === STEPS.UPLOAD) return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Importar Extrato</h1>
          <p className="page-subtitle">Envie um PDF ou imagem — a IA lê e categoriza automaticamente</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '📄', title: 'Extrato bancário', sub: 'PDF ou imagem do app' },
          { icon: '💳', title: 'Fatura de cartão', sub: 'Qualquer operadora' },
          { icon: '🖼️', title: 'Print de tela', sub: 'Screenshot do internet banking' },
        ].map((item) => (
          <div key={item.title} className="metric-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          border: `2px dashed ${dragging ? 'var(--color-green)' : file ? 'var(--color-green)' : 'var(--color-border-strong)'}`,
          background: dragging ? 'var(--color-green-light)' : file ? '#f0faf5' : 'var(--color-surface)',
          textAlign: 'center', padding: '3rem 2rem', cursor: 'pointer', transition: 'all .2s',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />

        {file ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-green-dark)' }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {(file.size / 1024).toFixed(0)} KB · {file.type.includes('pdf') ? 'PDF' : 'Imagem'}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={(e) => { e.stopPropagation(); setFile(null); }}>
              Trocar arquivo
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Arraste o arquivo aqui</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>ou clique para selecionar</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>PDF, JPG, PNG · Máximo 20MB</div>
          </>
        )}
      </div>

      {error && <p style={{ color: 'var(--color-red)', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}

      {file && (
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 12, fontSize: 15 }} onClick={processDocument}>
          🤖 Analisar documento com IA
        </button>
      )}

      <div className="card" style={{ marginTop: 20, background: 'var(--color-surface-2)', border: 'none' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>🔒 Privacidade</div>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          O documento é enviado temporariamente para análise e deletado imediatamente após o processamento.
          Nenhum arquivo fica armazenado nos servidores.
        </p>
      </div>
    </div>
  );

  // ── PROCESSING ──
  if (step === STEPS.PROCESSING) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ fontSize: 56, marginBottom: 24, animation: 'pulse 1.5s infinite' }}>🤖</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analisando documento...</div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
        A IA está lendo o extrato, identificando as transações e categorizando automaticamente.
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );

  // ── REVIEW ──
  if (step === STEPS.REVIEW) {
    const selectedTxs = transactions.filter(t => selected.has(t._tempId));
    const totalIncome = selectedTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = selectedTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const lowConfidence = transactions.filter(t => t.confidence === 'low').length;

    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Revisar transações</h1>
            <p className="page-subtitle">{transactions.length} transações encontradas · {selected.size} selecionadas</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={reset}>← Voltar</button>
            <button className="btn btn-primary" onClick={confirmImport} disabled={selected.size === 0}>
              ✓ Importar {selected.size} transações
            </button>
          </div>
        </div>

        {/* Resumo */}
        {extractedData && (
          <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            {extractedData.bankName && <span style={{ fontSize: 13 }}>🏦 <strong>{extractedData.bankName}</strong></span>}
            {extractedData.documentType && <span style={{ fontSize: 13 }}>📄 {extractedData.documentType}</span>}
            {extractedData.period && <span style={{ fontSize: 13 }}>📅 {extractedData.period}</span>}
            <span style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600 }}>+{formatCurrency(totalIncome)}</span>
            <span style={{ fontSize: 13, color: 'var(--color-red)', fontWeight: 600 }}>-{formatCurrency(totalExpense)}</span>
            {lowConfidence > 0 && (
              <span className="badge badge-amber">⚠️ {lowConfidence} com baixa confiança — revise</span>
            )}
          </div>
        )}

        {error && <p style={{ color: 'var(--color-red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {/* Selecionar todos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={selected.size === transactions.length}
            onChange={(e) => setSelected(e.target.checked ? new Set(transactions.map(t => t._tempId)) : new Set())}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--color-text-secondary)' }}>Selecionar todas</span>
        </div>

        <div className="card">
          {transactions.map((t) => (
            <div key={t._tempId} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
              borderBottom: '1px solid var(--color-border)',
              opacity: selected.has(t._tempId) ? 1 : 0.4,
            }}>
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(t._tempId)}
                onChange={() => toggleSelect(t._tempId)}
                style={{ width: 16, height: 16, marginTop: 6, cursor: 'pointer', flexShrink: 0 }}
              />

              {/* Ícone */}
              <div className="tx-icon" style={{ background: (CAT_COLORS[t.category] || '#888') + '20', flexShrink: 0, marginTop: 2 }}>
                {CAT_ICONS[t.category] || '📌'}
              </div>

              {/* Info editável */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--color-text-primary)' }}>
                  {t.description}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* Categoria */}
                  <select
                    className="form-control"
                    style={{ width: 'auto', fontSize: 11, padding: '3px 6px' }}
                    value={t.category}
                    onChange={(e) => updateTransaction(t._tempId, 'category', e.target.value)}
                  >
                    {[...CATEGORIES.income, ...CATEGORIES.expense].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Tipo */}
                  <select
                    className="form-control"
                    style={{ width: 'auto', fontSize: 11, padding: '3px 6px' }}
                    value={t.type}
                    onChange={(e) => updateTransaction(t._tempId, 'type', e.target.value)}
                  >
                    <option value="income">📈 Entrada</option>
                    <option value="expense">📉 Saída</option>
                  </select>

                  {/* Data */}
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: 'auto', fontSize: 11, padding: '3px 6px' }}
                    value={t.date}
                    onChange={(e) => updateTransaction(t._tempId, 'date', e.target.value)}
                  />
                </div>
              </div>

              {/* Valor e confiança */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className={`tx-amount ${t.type}`} style={{ fontSize: 14 }}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                <span className={`badge ${confidenceColor(t.confidence)}`} style={{ marginTop: 4, display: 'inline-block' }}>
                  {confidenceLabel(t.confidence)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={reset}>← Voltar</button>
          <button className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={confirmImport} disabled={selected.size === 0}>
            ✓ Importar {selected.size} transações
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Importação concluída!</div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
        <strong>{savedCount}</strong> transações foram importadas e salvas com sucesso.
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={reset}>📂 Importar outro</button>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>📊 Ver dashboard</button>
      </div>
    </div>
  );
}
