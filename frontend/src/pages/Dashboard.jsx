import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatMonth } from '../../utils/formatters';
import EntryModal from '../shared/EntryModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CAT_COLORS_GOLD = [
  '#C9A84C', '#8A6E2F', '#E8C97A', '#5A4420',
  '#D4A843', '#4A3818', '#F0C96A', '#3D2E14',
  '#B89040', '#6B5230', '#DDB85C', '#7A5E38',
  '#A07838', '#C4A050', '#9A8060',
];

export default function Dashboard() {
  const { summary, fetchSummary, month, year, changePeriod, loading } = useFinance();
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchSummary(); }, []);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickColor = isDark ? '#4A4845' : '#A8A49E';

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }),
  }));
  const years = [2023, 2024, 2025, 2026];

  const catData = summary?.byCategory || {};
  const catLabels = Object.keys(catData);
  const catValues = Object.values(catData);

  const income = summary?.income?.total || 0;
  const expense = summary?.expense?.total || 0;
  const fixed = summary?.fixed?.total || 0;
  const balance = summary?.balance || 0;
  const rate = summary?.commitmentRate || 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão geral</h1>
          <p className="page-subtitle">{formatMonth(month, year)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="period-selector">
            <select value={month} onChange={e => changePeriod(parseInt(e.target.value), year)}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={e => changePeriod(month, parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn btn-gold" onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" style={{ fontSize: 14 }} /> Lançar
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="metric-card">
          <div className="metric-label">Entradas</div>
          <div className="metric-value text-green">{formatCurrency(income)}</div>
          <div className="metric-sub up">
            <i className="ti ti-trending-up" style={{ fontSize: 11 }} />
            {summary?.income?.count || 0} recebimentos
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saídas variáveis</div>
          <div className="metric-value text-red">{formatCurrency(expense)}</div>
          <div className="metric-sub down">
            <i className="ti ti-trending-down" style={{ fontSize: 11 }} />
            {summary?.expense?.count || 0} pagamentos
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Despesas fixas</div>
          <div className="metric-value text-amber">{formatCurrency(fixed)}</div>
          <div className="metric-sub">
            <i className="ti ti-repeat" style={{ fontSize: 11 }} />
            {summary?.fixed?.items?.length || 0} contas
          </div>
        </div>
        <div className="metric-card gold">
          <div className="metric-label">Saldo livre</div>
          <div className="metric-value text-gold">{formatCurrency(balance)}</div>
          <div className="metric-sub up">
            <i className="ti ti-circle-check" style={{ fontSize: 11 }} />
            {rate}% da renda
          </div>
        </div>
      </div>

      {/* Destaques */}
      <div className="highlight-grid">
        <div className="hl-card">
          <div className="hl-label"><i className="ti ti-arrow-up-right" style={{ fontSize: 10 }} /> Maior entrada</div>
          <div className="hl-value text-green">{formatCurrency(summary?.income?.max?.amount)}</div>
          <div className="hl-name">{summary?.income?.max?.name || '—'}</div>
        </div>
        <div className="hl-card">
          <div className="hl-label"><i className="ti ti-arrow-down-right" style={{ fontSize: 10 }} /> Maior gasto</div>
          <div className="hl-value text-red">{formatCurrency(summary?.expense?.max?.amount)}</div>
          <div className="hl-name">{summary?.expense?.max?.name || '—'}</div>
        </div>
        <div className="hl-card">
          <div className="hl-label"><i className="ti ti-percentage" style={{ fontSize: 10 }} /> Maior taxa de juros</div>
          <div className="hl-value text-amber">
            {summary?.debts?.maxInterest ? `${summary.debts.maxInterest.interestRate.toFixed(2)}% a.m.` : '—'}
          </div>
          <div className="hl-name">{summary?.debts?.maxInterest?.name || '—'}</div>
        </div>
        <div className="hl-card">
          <div className="hl-label"><i className="ti ti-credit-card" style={{ fontSize: 10 }} /> Maior dívida</div>
          <div className="hl-value text-red">{formatCurrency(summary?.debts?.maxTotal?.totalDebt)}</div>
          <div className="hl-name">{summary?.debts?.maxTotal?.name || '—'}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid-3-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">
            <span>Entradas vs saídas</span>
            <span className="card-title-action">últimos 6 meses</span>
          </div>
          <div style={{ height: 220 }}>
            <Bar
              data={{
                labels: ['Mês-5', 'Mês-4', 'Mês-3', 'Mês-2', 'Mês-1', formatMonth(month, year).split(' ')[0]],
                datasets: [
                  {
                    label: 'Entradas',
                    data: [0, 0, 0, 0, 0, income],
                    backgroundColor: '#C9A84C',
                    borderRadius: 4,
                    borderSkipped: false,
                    barPercentage: 0.5,
                  },
                  {
                    label: 'Saídas',
                    data: [0, 0, 0, 0, 0, expense + fixed],
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                    borderRadius: 4,
                    borderSkipped: false,
                    barPercentage: 0.5,
                  },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
                  y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: v => 'R$' + (v / 1000).toFixed(0) + 'k' } },
                },
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-title"><span>Gastos por categoria</span></div>
          {catLabels.length > 0 ? (
            <>
              <div style={{ height: 180, position: 'relative' }}>
                <Doughnut
                  data={{
                    labels: catLabels,
                    datasets: [{ data: catValues, backgroundColor: CAT_COLORS_GOLD, borderWidth: 0, hoverOffset: 4 }],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false, cutout: '68%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` } },
                    },
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(expense + fixed)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>total gasto</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 12 }}>
                {catLabels.map((l, i) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: CAT_COLORS_GOLD[i], display: 'inline-block' }} />
                    {l}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-state-icon"><i className="ti ti-chart-pie" /></div>
              <div className="empty-state-sub">Nenhum gasto registrado</div>
            </div>
          )}
        </div>
      </div>

      {/* Comprometimento + Próximos */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title"><span>Comprometimento da renda</span></div>
          {income > 0 ? (
            <>
              {Object.entries(summary?.byCategory || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, val], i) => {
                const pct = Math.round((val / income) * 100);
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 2, background: CAT_COLORS_GOLD[i], display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: CAT_COLORS_GOLD[i] }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total comprometido</span>
                <span style={{ fontWeight: 600, color: rate > 80 ? 'var(--negative)' : rate > 60 ? 'var(--warning)' : 'var(--positive)', fontFamily: 'var(--font-mono)' }}>
                  {rate}%
                </span>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <div className="empty-state-sub">Adicione entradas para ver o comprometimento</div>
            </div>
          )}
        </div>

        {/* Próximos lançamentos */}
        <div className="card">
          <div className="card-title">
            <span>Próximos lançamentos</span>
            <span className="badge badge-gold">{summary?.upcoming?.length || 0}</span>
          </div>
          {summary?.upcoming?.length > 0 ? (
            summary.upcoming.map(f => (
              <div key={f._id} className="tx-row">
                <div className="tx-icon" style={{ background: f.type === 'income' ? 'rgba(61,170,106,0.1)' : 'rgba(217,95,59,0.1)' }}>
                  <i className={`ti ${f.type === 'income' ? 'ti-arrow-down' : 'ti-arrow-up'}`}
                    style={{ fontSize: 14, color: f.type === 'income' ? 'var(--positive)' : 'var(--negative)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-name">{f.name}</div>
                  <div className="tx-meta">{new Date(f.expectedDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <span className={`badge ${f.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                  {formatCurrency(f.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <div className="empty-state-icon"><i className="ti ti-calendar-event" /></div>
              <div className="empty-state-sub">Nenhum lançamento futuro próximo</div>
            </div>
          )}
        </div>
      </div>

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchSummary(); }} />}
    </div>
  );
}