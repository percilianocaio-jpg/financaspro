import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, CAT_COLORS, CAT_ICONS, CATEGORIES } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

export default function Transactions() {
  const { transactions, fetchTransactions, deleteTransaction, month, year } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => { fetchTransactions(); }, [month, year]);

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat && t.category !== filterCat) return false;
    return true;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lançamentos</h1>
          <p className="page-subtitle">{filtered.length} registros encontrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Lançar</button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ v: 'all', l: 'Todos' }, { v: 'income', l: '📈 Entradas' }, { v: 'expense', l: '📉 Saídas' }].map((opt) => (
            <button
              key={opt.v}
              className="btn btn-sm"
              style={{
                background: filterType === opt.v ? 'var(--color-green)' : 'var(--color-surface-2)',
                color: filterType === opt.v ? '#fff' : 'var(--color-text-primary)',
                border: 'none',
              }}
              onClick={() => setFilterType(opt.v)}
            >{opt.l}</button>
          ))}
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {[...CATEGORIES.income, ...CATEGORIES.expense].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13 }}>
          <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>+{formatCurrency(totalIncome)}</span>
          <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>-{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Nenhum lançamento encontrado</div>
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t._id} className="tx-row">
              <div className="tx-icon" style={{ background: (CAT_COLORS[t.category] || '#888') + '20' }}>
                {CAT_ICONS[t.category] || '📌'}
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-name">{t.name}</div>
                <div className="tx-meta">{t.category} · {formatDate(t.date)}</div>
              </div>
              <div className={`tx-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </div>
              <button
                className="btn btn-danger btn-sm btn-icon"
                style={{ marginLeft: 8 }}
                onClick={() => { if (window.confirm('Remover este lançamento?')) deleteTransaction(t._id); }}
              >🗑</button>
            </div>
          ))
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchTransactions(); }} />}
    </div>
  );
}
