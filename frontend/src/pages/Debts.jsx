import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

export default function Debts() {
  const { debts, fetchDebts, deleteDebt } = useFinance();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchDebts(); }, []);

  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const totalDebt = debts.reduce((s, d) => s + d.totalDebt, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);

  const getRateColor = (rate) => {
    if (rate >= 5) return 'var(--color-red)';
    if (rate >= 2) return 'var(--color-amber)';
    return 'var(--color-green)';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dívidas e Cartões</h1>
          <p className="page-subtitle">{debts.length} dívidas ativas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="metric-card">
          <div className="metric-label">Dívida total</div>
          <div className="metric-value red">{formatCurrency(totalDebt)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Parcelas mensais</div>
          <div className="metric-value amber">{formatCurrency(totalMonthly)}</div>
          <div className="metric-sub">comprometido por mês</div>
        </div>
      </div>

      {/* Dica: prioridade de pagamento */}
      {sortedDebts.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: '#EAF3DE', border: '1px solid #C0DD97' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-green-dark)' }}>💡 Estratégia recomendada</div>
          <p style={{ fontSize: 13, color: 'var(--color-green-dark)' }}>
            Pague primeiro a dívida com maior taxa de juros: <strong>{sortedDebts[0].name}</strong> ({sortedDebts[0].interestRate.toFixed(2)}% a.m.).
            Isso minimiza o total pago ao longo do tempo.
          </p>
        </div>
      )}

      <div className="card">
        {sortedDebts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-text">Nenhuma dívida cadastrada</div>
          </div>
        ) : (
          sortedDebts.map((d, i) => (
            <div key={d._id} className="tx-row" style={{ alignItems: 'flex-start' }}>
              <div className="tx-icon" style={{ background: '#FAECE7', marginTop: 2 }}>💳</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="tx-name">{d.name}</div>
                  {i === 0 && <span className="badge badge-red">Prioridade 1</span>}
                </div>
                <div className="tx-meta">{d.category}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    Dívida total: <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(d.totalDebt)}</strong>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    Parcela: <strong style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(d.monthlyPayment)}/mês</strong>
                  </span>
                  {d.remainingInstallments && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      Restam: <strong style={{ color: 'var(--color-text-primary)' }}>{d.remainingInstallments}x</strong>
                    </span>
                  )}
                  {d.dueDay && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      Vence dia <strong style={{ color: 'var(--color-text-primary)' }}>{d.dueDay}</strong>
                    </span>
                  )}
                </div>
                {/* Barra juros */}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 50 }}>Juros:</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, d.interestRate * 5)}%`, background: getRateColor(d.interestRate) }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getRateColor(d.interestRate), minWidth: 60, textAlign: 'right' }}>
                    {d.interestRate.toFixed(2)}% a.m.
                  </span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm btn-icon"
                style={{ marginLeft: 8, marginTop: 2 }}
                onClick={() => { if (window.confirm('Remover esta dívida?')) deleteDebt(d._id); }}
              >🗑</button>
            </div>
          ))
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchDebts(); }} />}
    </div>
  );
}
