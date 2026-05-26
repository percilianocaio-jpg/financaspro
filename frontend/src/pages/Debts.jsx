import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

export default function Debts() {
  const { debts, fetchDebts, deleteDebt } = useFinance();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchDebts(); }, []);

  const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const totalDebt = debts.reduce((s, d) => s + d.totalDebt, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);

  const rateColor = r => r >= 5 ? 'var(--negative)' : r >= 2 ? 'var(--warning)' : 'var(--positive)';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dívidas e Cartões</h1>
          <p className="page-subtitle">{debts.length} dívidas ativas</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> Adicionar
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="metric-card">
          <div className="metric-label">Dívida total</div>
          <div className="metric-value text-red">{formatCurrency(totalDebt)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Parcelas mensais</div>
          <div className="metric-value text-amber">{formatCurrency(totalMonthly)}</div>
          <div className="metric-sub">comprometido por mês</div>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="card" style={{ marginBottom: 14, borderColor: 'var(--gold-border)', background: 'var(--gold-bg)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <i className="ti ti-bulb" style={{ fontSize: 18, color: 'var(--gold)', marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--gold)', marginBottom: 4, fontSize: 13 }}>Estratégia recomendada</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Priorize quitar <strong style={{ color: 'var(--text-primary)' }}>{sorted[0].name}</strong> primeiro —
                maior taxa de juros ({sorted[0].interestRate.toFixed(2)}% a.m.). Isso minimiza o total pago.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title"><span>Dívidas ativas</span></div>
        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="ti ti-credit-card" /></div>
            <div className="empty-state-title">Nenhuma dívida cadastrada</div>
          </div>
        ) : (
          sorted.map((d, i) => (
            <div key={d._id} className="tx-row" style={{ alignItems: 'flex-start' }}>
              <div className="tx-icon" style={{ background: 'rgba(217,95,59,0.1)', marginTop: 2 }}>
                <i className="ti ti-credit-card" style={{ fontSize: 15, color: 'var(--negative)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div className="tx-name">{d.name}</div>
                  {i === 0 && <span className="badge badge-red">Prioridade</span>}
                </div>
                <div className="tx-meta" style={{ marginBottom: 8 }}>{d.category}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Total: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.totalDebt)}</strong></span>
                  <span>Parcela: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.monthlyPayment)}/mês</strong></span>
                  {d.remainingInstallments && <span>Restam: <strong style={{ color: 'var(--text-primary)' }}>{d.remainingInstallments}x</strong></span>}
                  {d.dueDay && <span>Vence dia <strong style={{ color: 'var(--text-primary)' }}>{d.dueDay}</strong></span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 36 }}>Juros</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, d.interestRate * 5)}%`, background: rateColor(d.interestRate) }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: rateColor(d.interestRate), width: 70, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {d.interestRate.toFixed(2)}% a.m.
                  </span>
                </div>
              </div>
              <button className="btn btn-danger btn-sm btn-icon" style={{ marginLeft: 8, marginTop: 2 }}
                onClick={() => { if (window.confirm('Remover esta dívida?')) deleteDebt(d._id); }}>
                <i className="ti ti-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchDebts(); }} />}
    </div>
  );
}