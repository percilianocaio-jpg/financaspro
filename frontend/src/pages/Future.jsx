import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

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
      <div className="tx-icon" style={{ background: f.type === 'income' ? '#EAF3DE' : '#FAECE7' }}>
        {f.type === 'income' ? '📈' : '📉'}
      </div>
      <div style={{ flex: 1 }}>
        <div className="tx-name">{f.name}</div>
        <div className="tx-meta">{f.category} · Previsto: {formatDate(f.expectedDate)}</div>
      </div>
      <span className={`badge ${f.type === 'income' ? 'badge-green' : 'badge-red'}`} style={{ marginRight: 8 }}>
        {f.type === 'income' ? '+' : '-'}{formatCurrency(f.amount)}
      </span>
      <button
        className="btn btn-sm"
        style={{ background: 'var(--color-green-light)', color: 'var(--color-green-dark)', border: 'none', marginRight: 4 }}
        onClick={() => { if (window.confirm('Marcar como realizado?')) realizeFuture(f._id); }}
        title="Marcar como realizado"
      >✓</button>
      <button
        className="btn btn-danger btn-sm btn-icon"
        onClick={() => { if (window.confirm('Remover este lançamento futuro?')) deleteFuture(f._id); }}
      >🗑</button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lançamentos Futuros</h1>
          <p className="page-subtitle">{future.length} previstos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Adicionar</button>
      </div>

      {/* Resumo */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="metric-card">
          <div className="metric-label">Entradas previstas</div>
          <div className="metric-value green">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saídas previstas</div>
          <div className="metric-value red">{formatCurrency(totalExpense)}</div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--color-red)' }}>
          <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--color-red)' }}>⚠️ Atrasados / pendentes</div>
          {overdue.map((f) => <FutureRow key={f._id} f={f} />)}
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 12 }}>📅 Próximos lançamentos</div>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-text">Nenhum lançamento futuro cadastrado</div>
          </div>
        ) : (
          upcoming.map((f) => <FutureRow key={f._id} f={f} />)
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchFuture(); }} />}
    </div>
  );
}
