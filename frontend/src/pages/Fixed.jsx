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
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> Adicionar
        </button>
      </div>

      {income > 0 && Object.keys(byCategory).length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title"><span>Comprometimento por categoria</span></div>
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
            const pct = Math.min(100, Math.round((val / income) * 100));
            const color = pct > 20 ? 'var(--negative)' : pct > 10 ? 'var(--warning)' : 'var(--positive)';
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`ti ${CAT_ICONS[cat] || 'ti-dots'}`} style={{ fontSize: 13, color: CAT_COLORS[cat] || 'var(--text-muted)' }} />
                    {cat}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(val)} · {pct}%
                  </span>
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
        <div className="card-title"><span>Contas mensais</span></div>
        {fixed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="ti ti-repeat" /></div>
            <div className="empty-state-title">Nenhuma despesa fixa cadastrada</div>
            <div className="empty-state-sub">Adicione suas contas recorrentes</div>
          </div>
        ) : (
          <>
            {fixed.map(f => (
              <div key={f._id} className="tx-row">
                <div className="tx-icon" style={{ background: (CAT_COLORS[f.category] || '#888') + '18' }}>
                  <i className={`ti ${CAT_ICONS[f.category] || 'ti-dots'}`}
                    style={{ fontSize: 15, color: CAT_COLORS[f.category] || 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-name">{f.name}</div>
                  <div className="tx-meta">{f.category} · vence dia {f.dueDay}</div>
                </div>
                <span className="badge badge-amber" style={{ marginRight: 10, fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(f.amount)}/mês
                </span>
                <button className="btn btn-danger btn-sm btn-icon"
                  onClick={() => { if (window.confirm('Remover esta despesa fixa?')) deleteFixed(f._id); }}>
                  <i className="ti ti-trash" style={{ fontSize: 14 }} />
                </button>
              </div>
            ))}
            <div style={{ paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total mensal fixo</span>
              <span style={{ fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchFixed(); }} />}
    </div>
  );
}