import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES, currentMonth, currentYear } from '../../utils/formatters';

const ENTRY_TYPES = [
  { value: 'income', label: 'Entrada', icon: 'ti-arrow-down' },
  { value: 'expense', label: 'Saída', icon: 'ti-arrow-up' },
  { value: 'fixed', label: 'Despesa Fixa', icon: 'ti-repeat' },
  { value: 'future', label: 'Futuro', icon: 'ti-calendar-event' },
  { value: 'debt', label: 'Dívida', icon: 'ti-credit-card' },
];

export default function EntryModal({ onClose }) {
  const { addTransaction, addFixed, addFuture, addDebt } = useFinance();
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '', amount: '', category: '', date: today, notes: '',
    dueDay: '1', interestRate: '', totalDebt: '', monthlyPayment: '',
    remainingInstallments: '', futureType: 'expense',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const categories = type === 'income' ? CATEGORIES.income
    : type === 'fixed' ? CATEGORIES.fixed
    : type === 'debt' ? CATEGORIES.debt
    : CATEGORIES.expense;

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.category) return setError('Preencha os campos obrigatórios.');
    setLoading(true); setError('');
    try {
      const amount = parseFloat(form.amount);
      if (type === 'income' || type === 'expense') {
        await addTransaction({ name: form.name, amount, type, category: form.category, date: form.date, notes: form.notes });
      } else if (type === 'fixed') {
        await addFixed({ name: form.name, amount, category: form.category, dueDay: parseInt(form.dueDay), notes: form.notes });
      } else if (type === 'future') {
        await addFuture({ name: form.name, amount, type: form.futureType, category: form.category, expectedDate: form.date, notes: form.notes });
      } else if (type === 'debt') {
        await addDebt({
          name: form.name, category: form.category,
          monthlyPayment: amount,
          totalDebt: parseFloat(form.totalDebt) || amount,
          interestRate: parseFloat(form.interestRate) || 0,
          remainingInstallments: form.remainingInstallments ? parseInt(form.remainingInstallments) : null,
          dueDay: parseInt(form.dueDay), notes: form.notes,
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Novo lançamento</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <i className="ti ti-x" style={{ fontSize: 15 }} />
          </button>
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label className="form-label">Tipo</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ENTRY_TYPES.map(t => (
              <button
                key={t.value}
                className="btn btn-sm"
                style={{
                  background: type === t.value ? 'var(--gold)' : 'var(--bg-card2)',
                  color: type === t.value ? '#0A0A0A' : 'var(--text-secondary)',
                  border: type === t.value ? 'none' : '1px solid var(--border)',
                  fontWeight: type === t.value ? 600 : 400,
                }}
                onClick={() => { setType(t.value); set('category', ''); }}
              >
                <i className={`ti ${t.icon}`} style={{ fontSize: 13 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group form-full">
            <label className="form-label">Descrição *</label>
            <input className="form-control" placeholder="Ex: Conta de luz, Salário..."
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Valor (R$) *</label>
            <input className="form-control" type="number" min="0" step="0.01" placeholder="0,00"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Categoria *</label>
            <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Selecionar...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {type !== 'fixed' && (
            <div className="form-group">
              <label className="form-label">{type === 'future' ? 'Data prevista' : 'Data'}</label>
              <input className="form-control" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          )}

          {(type === 'fixed' || type === 'debt') && (
            <div className="form-group">
              <label className="form-label">Dia de vencimento</label>
              <input className="form-control" type="number" min="1" max="31"
                value={form.dueDay} onChange={e => set('dueDay', e.target.value)} />
            </div>
          )}

          {type === 'future' && (
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={form.futureType} onChange={e => set('futureType', e.target.value)}>
                <option value="income">Entrada prevista</option>
                <option value="expense">Despesa prevista</option>
              </select>
            </div>
          )}

          {type === 'debt' && (
            <>
              <div className="form-group">
                <label className="form-label">Dívida total (R$)</label>
                <input className="form-control" type="number" min="0" step="0.01" placeholder="0,00"
                  value={form.totalDebt} onChange={e => set('totalDebt', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Taxa de juros (% a.m.)</label>
                <input className="form-control" type="number" min="0" step="0.01" placeholder="0,00"
                  value={form.interestRate} onChange={e => set('interestRate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Parcelas restantes</label>
                <input className="form-control" type="number" min="1" placeholder="Ex: 12"
                  value={form.remainingInstallments} onChange={e => set('remainingInstallments', e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group form-full">
            <label className="form-label">Observações</label>
            <input className="form-control" placeholder="Opcional..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(217,95,59,0.1)', border: '1px solid rgba(217,95,59,0.2)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--negative)', marginBottom: 14 }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
          </div>
        )}

        <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }}
          onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Salvando...</>
            : <><i className="ti ti-check" style={{ fontSize: 14 }} /> Salvar lançamento</>
          }
        </button>
      </div>
    </div>
  );
}