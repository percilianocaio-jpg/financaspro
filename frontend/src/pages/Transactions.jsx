import { useEffect, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, CAT_COLORS, CAT_ICONS, CATEGORIES } from '../../utils/formatters';
import EntryModal from '../shared/EntryModal';

export default function Transactions() {
  const { transactions, fetchTransactions, deleteTransaction, month, year } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => { fetchTransactions(); }, [month, year]);

  const filtered = transactions.filter(t => {
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
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> Lançar
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { v: 'all', l: 'Todos', icon: 'ti-list' },
            { v: 'income', l: 'Entradas', icon: 'ti-arrow-down' },
            { v: 'expense', l: 'Saídas', icon: 'ti-arrow-up' },
          ].map(opt => (
            <button key={opt.v} className="btn btn-sm"
              style={{
                background: filterType === opt.v ? 'var(--gold)' : 'var(--bg-card2)',
                color: filterType === opt.v ? '#0A0A0A' : 'var(--text-secondary)',
                border: filterType === opt.v ? 'none' : '1px solid var(--border)',
              }}
              onClick={() => setFilterType(opt.v)}
            >
              <i className={`ti ${opt.icon}`} style={{ fontSize: 12 }} /> {opt.l}
            </button>
          ))}
        </div>

        <select className="form-control" style={{ width: 'auto', minWidth: 170 }}
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {[...CATEGORIES.income, ...CATEGORIES.expense].map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          <span className="text-green">+{formatCurrency(totalIncome)}</span>
          <span className="text-red">-{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="ti ti-list-details" /></div>
            <div className="empty-state-title">Nenhum lançamento encontrado</div>
            <div className="empty-state-sub">Ajuste os filtros ou adicione um novo lançamento</div>
          </div>
        ) : (
          filtered.map(t => (
            <div key={t._id} className="tx-row">
              <div className="tx-icon" style={{ background: (CAT_COLORS[t.category] || '#888') + '18' }}>
                <i className={`ti ${CAT_ICONS[t.category] || 'ti-dots'}`}
                  style={{ fontSize: 15, color: CAT_COLORS[t.category] || 'var(--text-muted)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tx-name">{t.name}</div>
                <div className="tx-meta">{t.category} · {formatDate(t.date)}</div>
              </div>
              <div className={`tx-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </div>
              <button className="btn btn-danger btn-sm btn-icon" style={{ marginLeft: 8 }}
                onClick={() => { if (window.confirm('Remover este lançamento?')) deleteTransaction(t._id); }}>
                <i className="ti ti-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchTransactions(); }} />}
    </div>
  );
}