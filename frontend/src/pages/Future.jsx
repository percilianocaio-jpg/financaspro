import { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EntryModal from '../shared/EntryModal';

export default function Future() {
  const { future, fetchFuture, realizeFuture, deleteFuture } = useFinance();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchFuture(); }, []);

  const upcoming = future.filter(f => new Date(f.expectedDate) >= new Date());
  const overdue = future.filter(f => new Date(f.expectedDate) < new Date());
  const totalIncome = future.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = future.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  const FutureRow = ({ f }) => (
    <div className="tx-row">
      <div className="tx-icon" style={{ background: f.type === 'income' ? 'rgba(61,170,106,0.1)' : 'rgba(217,95,59,0.1)' }}>
        <i className={`ti ${f.type === 'income' ? 'ti-arrow-down' : 'ti-arrow-up'}`}
          style={{ fontSize: 15, color: f.type === 'income' ? 'var(--positive)' : 'var(--negative)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="tx-name">{f.name}</div>
        <div className="tx-meta">{f.category} · Previsto: {formatDate(f.expectedDate)}</div>
      </div>
      <span className={`badge ${f.type === 'income' ? 'badge-green' : 'badge-red'}`}
        style={{ marginRight: 8, fontFamily: 'var(--font-mono)' }}>
        {f.type === 'income' ? '+' : '-'}{formatCurrency(f.amount)}
      </span>
      <button className="btn btn-sm" title="Marcar como realizado"
        style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold-border)', marginRight: 4 }}
        onClick={() => { if (window.confirm('Marcar como realizado?')) realizeFuture(f._id); }}>
        <i className="ti ti-check" style={{ fontSize: 13 }} />
      </button>
      <button className="btn btn-danger btn-sm btn-icon"
        onClick={() => { if (window.confirm('Remover este lançamento?')) deleteFuture(f._id); }}>
        <i className="ti ti-trash" style={{ fontSize: 14 }} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lançamentos Futuros</h1>
          <p className="page-subtitle">{future.length} previstos</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> Adicionar
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="metric-card">
          <div className="metric-label">Entradas previstas</div>
          <div className="metric-value text-green">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saídas previstas</div>
          <div className="metric-value text-red">{formatCurrency(totalExpense)}</div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card" style={{ marginBottom: 14, borderColor: 'rgba(217,95,59,0.3)' }}>
          <div className="card-title" style={{ color: 'var(--negative)' }}>
            <span><i className="ti ti-alert-triangle" style={{ marginRight: 6 }} />Pendentes / atrasados</span>
            <span className="badge badge-red">{overdue.length}</span>
          </div>
          {overdue.map(f => <FutureRow key={f._id} f={f} />)}
        </div>
      )}

      <div className="card">
        <div className="card-title">
          <span>Próximos lançamentos</span>
          <span className="badge badge-gold">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="ti ti-calendar-event" /></div>
            <div className="empty-state-title">Nenhum lançamento futuro</div>
            <div className="empty-state-sub">Adicione receitas ou despesas previstas</div>
          </div>
        ) : (
          upcoming.map(f => <FutureRow key={f._id} f={f} />)
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchFuture(); }} />}
    </div>
  );
}