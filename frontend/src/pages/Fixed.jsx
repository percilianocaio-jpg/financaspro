import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, CAT_COLORS, CAT_ICONS } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

export default function Fixed() {
  const { fixed, fetchFixed, deleteFixed, summary } = useFinance();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchFixed(); }, []);

  const total = fixed.reduce((s, f) => s + f.amount, 0);
  const income = summary?.income?.total || 0;

  const byCategory = fixed.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + f.amount;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Despesas Fixas</h1>
          <p className="page-subtitle">{fixed.length} contas mensais · {formatCurrency(total)}/mês</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      {/* Comprometimento por categoria */}
      {income > 0 && Object.keys(byCategory).length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>📊 Comprometimento da renda por categoria</div>
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
            const pct = Math.min(100, Math.round((val / income) * 100));
            const color = pct > 20 ? 'var(--color-red)' : pct > 10 ? 'var(--color-amber)' : 'var(--color-green)';
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--color-text-primary)' }}>{CAT_ICONS[cat]} {cat}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{formatCurrency(val)} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        {fixed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔁</div>
            <div className="empty-state-text">Nenhuma despesa fixa cadastrada</div>
          </div>
        ) : (
          <>
            {fixed.map((f) => (
              <div key={f._id} className="tx-row">
                <div className="tx-icon" style={{ background: (CAT_COLORS[f.category] || '#888') + '20' }}>
                  {CAT_ICONS[f.category] || '📌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-name">{f.name}</div>
                  <div className="tx-meta">{f.category} · vence dia {f.dueDay}</div>
                </div>
                <span className="badge badge-amber" style={{ marginRight: 8 }}>{formatCurrency(f.amount)}/mês</span>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => { if (window.confirm('Remover esta despesa fixa?')) deleteFixed(f._id); }}
                >🗑</button>
              </div>
            ))}
            <div style={{ paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid var(--color-border)', marginTop: 4 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total mensal fixo</span>
              <span style={{ fontWeight: 700, color: 'var(--color-amber)' }}>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchFixed(); }} />}
    </div>
  );
}
