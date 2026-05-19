import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const EMOJIS = ['🏦', '✈️', '🏠', '🚗', '📚', '💍', '🏥', '🎮', '👶', '🌴', '💻', '🎯'];
const COLORS = ['#1D9E75', '#185FA5', '#D85A30', '#BA7517', '#534AB7', '#D4537E', '#639922', '#E24B4A'];

const MOVE_LABELS = { deposit: 'Depósito', withdrawal: 'Retirada', yield: 'Rendimento' };
const MOVE_COLORS = { deposit: 'badge-green', withdrawal: 'badge-red', yield: 'badge-blue' };
const MOVE_SIGNS  = { deposit: '+', withdrawal: '-', yield: '+' };

export default function Savings() {
  const [boxes, setBoxes] = useState([]);
  const [selected, setSelected] = useState(null); // caixinha aberta
  const [showCreate, setShowCreate] = useState(false);
  const [showMove, setShowMove] = useState(null); // 'deposit' | 'withdrawal' | 'yield'
  const [loading, setLoading] = useState(true);

  // Formulário nova caixinha
  const [form, setForm] = useState({ name: '', goal: '', objective: '', color: COLORS[0], emoji: EMOJIS[0] });
  // Formulário movimentação
  const [moveForm, setMoveForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchBoxes = async () => {
    try {
      const { data } = await api.get('/savings');
      setBoxes(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelected = async (id) => {
    const { data } = await api.get(`/savings/${id}`);
    setSelected(data);
  };

  useEffect(() => { fetchBoxes(); }, []);

  const createBox = async () => {
    if (!form.name) return;
    try {
      const { data } = await api.post('/savings', {
        ...form,
        goal: form.goal ? parseFloat(form.goal) : null,
      });
      setBoxes(prev => [data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', goal: '', objective: '', color: COLORS[0], emoji: EMOJIS[0] });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao criar caixinha.');
    }
  };

  const doMovement = async () => {
    if (!moveForm.amount || !selected) return;
    try {
      const { data } = await api.post(`/savings/${selected._id}/${showMove}`, {
        amount: parseFloat(moveForm.amount),
        date: moveForm.date,
        notes: moveForm.notes,
      });
      setSelected(data);
      setBoxes(prev => prev.map(b => b._id === data._id ? data : b));
      setShowMove(null);
      setMoveForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro na movimentação.');
    }
  };

  const deleteBox = async (id) => {
    if (!window.confirm('Arquivar esta caixinha?')) return;
    await api.delete(`/savings/${id}`);
    setBoxes(prev => prev.filter(b => b._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  // Gráfico de evolução de saldo
  const chartData = (box) => {
    if (!box.movements.length) return null;
    const sorted = [...box.movements].sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      labels: sorted.map(m => new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
      datasets: [{
        label: 'Saldo',
        data: sorted.map(m => m.balanceAfter),
        borderColor: box.color,
        backgroundColor: box.color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: box.color,
      }],
    };
  };

  const totalPatrimonio = boxes.reduce((s, b) => s + b.currentBalance, 0);
  const totalRendimento = boxes.reduce((s, b) => s + b.totalYield, 0);

  // ── DETAIL VIEW ──
  if (selected) {
    const chart = chartData(selected);
    const progress = selected.goal ? Math.min(100, Math.round((selected.currentBalance / selected.goal) * 100)) : null;
    const sortedMoves = [...selected.movements].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>← Voltar</button>
            <div>
              <h1 className="page-title">{selected.emoji} {selected.name}</h1>
              {selected.objective && <p className="page-subtitle">{selected.objective}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" style={{ background: '#EAF3DE', color: '#0F6E56', border: 'none' }} onClick={() => setShowMove('deposit')}>+ Depositar</button>
            <button className="btn btn-sm" style={{ background: '#FAECE7', color: '#D85A30', border: 'none' }} onClick={() => setShowMove('withdrawal')}>- Retirar</button>
            <button className="btn btn-sm" style={{ background: '#E6F1FB', color: '#185FA5', border: 'none' }} onClick={() => setShowMove('yield')}>📈 Rendimento</button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="metric-card">
            <div className="metric-label">Saldo atual</div>
            <div className="metric-value green">{formatCurrency(selected.currentBalance)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total depositado</div>
            <div className="metric-value">{formatCurrency(selected.totalDeposited)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total de rendimento</div>
            <div className="metric-value" style={{ color: 'var(--color-blue)' }}>
              {formatCurrency(selected.totalYield)}
              {selected.totalDeposited > 0 && (
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 6 }}>
                  ({((selected.totalYield / selected.totalDeposited) * 100).toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progresso da meta */}
        {selected.goal && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>🎯 Meta: {formatCurrency(selected.goal)}</span>
              <span style={{ color: progress >= 100 ? 'var(--color-green)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                {progress}% {progress >= 100 ? '✅ Concluída!' : `· faltam ${formatCurrency(selected.goal - selected.currentBalance)}`}
              </span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{
                width: `${progress}%`,
                background: progress >= 100 ? 'var(--color-green)' : selected.color,
              }} />
            </div>
          </div>
        )}

        {/* Gráfico */}
        {chart && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📈 Evolução do saldo</div>
            <div style={{ height: 200 }}>
              <Line data={chart} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { callback: v => 'R$' + v.toLocaleString('pt-BR') } },
                  x: { grid: { display: false } },
                },
              }} />
            </div>
          </div>
        )}

        {/* Histórico */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>📋 Histórico de movimentações</div>
          {sortedMoves.length === 0 ? (
            <div className="empty-state"><div className="empty-state-text">Nenhuma movimentação ainda.</div></div>
          ) : (
            sortedMoves.map((m, i) => (
              <div key={i} className="tx-row">
                <div className="tx-icon" style={{ background: m.type === 'withdrawal' ? '#FAECE7' : m.type === 'yield' ? '#E6F1FB' : '#EAF3DE' }}>
                  {m.type === 'deposit' ? '💰' : m.type === 'withdrawal' ? '💸' : '📈'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-name">{MOVE_LABELS[m.type]}{m.notes ? ` · ${m.notes}` : ''}</div>
                  <div className="tx-meta">{formatDate(m.date)} · saldo: {formatCurrency(m.balanceAfter)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${MOVE_COLORS[m.type]}`}>
                    {MOVE_SIGNS[m.type]}{formatCurrency(m.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal movimentação */}
        {showMove && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMove(null)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">
                  {showMove === 'deposit' ? '💰 Depositar' : showMove === 'withdrawal' ? '💸 Retirar' : '📈 Registrar Rendimento'}
                </h2>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowMove(null)}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$) *</label>
                <input className="form-control" type="number" min="0" step="0.01" placeholder="0,00"
                  value={moveForm.amount} onChange={e => setMoveForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input className="form-control" type="date" value={moveForm.date}
                  onChange={e => setMoveForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Observação</label>
                <input className="form-control" placeholder="Opcional..." value={moveForm.notes}
                  onChange={e => setMoveForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={doMovement}>
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Caixinhas</h1>
          <p className="page-subtitle">{boxes.length} reservas ativas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Nova caixinha</button>
      </div>

      {/* Resumo geral */}
      {boxes.length > 0 && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="metric-card">
            <div className="metric-label">💰 Total em reservas</div>
            <div className="metric-value green">{formatCurrency(totalPatrimonio)}</div>
            <div className="metric-sub">{boxes.length} caixinhas</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">📈 Total rendido</div>
            <div className="metric-value" style={{ color: 'var(--color-blue)' }}>{formatCurrency(totalRendimento)}</div>
            <div className="metric-sub">
              {totalPatrimonio > 0 ? `${((totalRendimento / (totalPatrimonio - totalRendimento)) * 100).toFixed(2)}% de rentabilidade` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Grid de caixinhas */}
      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : boxes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <div className="empty-state-text">Nenhuma caixinha criada ainda.<br />Crie sua primeira reserva!</div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {boxes.map(box => {
            const progress = box.goal ? Math.min(100, Math.round((box.currentBalance / box.goal) * 100)) : null;
            return (
              <div key={box._id} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${box.color}` }}
                onClick={() => fetchSelected(box._id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{box.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{box.name}</div>
                      {box.objective && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{box.objective}</div>}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); deleteBox(box._id); }}>🗑</button>
                </div>

                <div style={{ fontSize: 22, fontWeight: 700, color: box.color, marginBottom: 4 }}>
                  {formatCurrency(box.currentBalance)}
                </div>

                {box.totalYield > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--color-blue)', marginBottom: 8 }}>
                    📈 +{formatCurrency(box.totalYield)} rendido
                  </div>
                )}

                {progress !== null && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      <span>Meta: {formatCurrency(box.goal)}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--color-green)' : box.color }} />
                    </div>
                  </>
                )}

                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                  {box.movements.length} movimentações · clique para detalhes
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar caixinha */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Nova caixinha</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowCreate(false)}>✕</button>
            </div>

            {/* Emoji picker */}
            <div className="form-group">
              <label className="form-label">Ícone</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    style={{ fontSize: 22, padding: '4px 8px', border: form.emoji === e ? `2px solid var(--color-green)` : '2px solid transparent', borderRadius: 8, background: 'var(--color-surface-2)', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div className="form-group">
              <label className="form-label">Cor</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #333' : '3px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-control" placeholder="Ex: Viagem, Emergência..." value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Objetivo</label>
              <input className="form-control" placeholder="Ex: Viagem para Europa em 2026" value={form.objective}
                onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Meta (R$)</label>
              <input className="form-control" type="number" min="0" step="0.01" placeholder="Opcional"
                value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={createBox}>
              ✓ Criar caixinha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}