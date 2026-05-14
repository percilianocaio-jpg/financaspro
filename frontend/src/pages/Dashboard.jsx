import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonth, CAT_COLORS } from '../utils/formatters';
import EntryModal from '../components/shared/EntryModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { summary, fetchSummary, month, year, changePeriod, loading } = useFinance();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchSummary(); }, []);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }) }));
  const years = [2023, 2024, 2025, 2026];

  const catData = summary?.byCategory || {};
  const catLabels = Object.keys(catData);
  const catValues = Object.values(catData);
  const catColors = catLabels.map((l) => CAT_COLORS[l] || '#888');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p className="page-subtitle">{formatMonth(month, year)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="month-selector">
            <select value={month} onChange={(e) => changePeriod(parseInt(e.target.value), year)}>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={(e) => changePeriod(month, parseInt(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Lançar</button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric-card">
          <div className="metric-label">Entradas</div>
          <div className="metric-value green">{formatCurrency(summary?.income?.total)}</div>
          <div className="metric-sub">{summary?.income?.count || 0} recebimentos</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saídas variáveis</div>
          <div className="metric-value red">{formatCurrency(summary?.expense?.total)}</div>
          <div className="metric-sub">{summary?.expense?.count || 0} pagamentos</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Despesas fixas</div>
          <div className="metric-value amber">{formatCurrency(summary?.fixed?.total)}</div>
          <div className="metric-sub">{summary?.fixed?.items?.length || 0} contas</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saldo do mês</div>
          <div className={`metric-value ${(summary?.balance || 0) >= 0 ? 'green' : 'red'}`}>
            {formatCurrency(summary?.balance)}
          </div>
          <div className="metric-sub">livre: {formatCurrency(summary?.freeCash)}</div>
        </div>
      </div>

      {/* Destaques */}
      <div className="highlight-grid" style={{ marginBottom: 20 }}>
        <div className="highlight-card">
          <div className="hl-label">📈 Maior entrada</div>
          <div className="hl-value text-green">{formatCurrency(summary?.income?.max?.amount)}</div>
          <div className="hl-name">{summary?.income?.max?.name || '—'}</div>
        </div>
        <div className="highlight-card">
          <div className="hl-label">📉 Maior gasto</div>
          <div className="hl-value text-red">{formatCurrency(summary?.expense?.max?.amount)}</div>
          <div className="hl-name">{summary?.expense?.max?.name || '—'}</div>
        </div>
        <div className="highlight-card">
          <div className="hl-label">💳 Maior taxa de juros</div>
          <div className="hl-value" style={{ color: 'var(--color-amber)' }}>
            {summary?.debts?.maxInterest ? `${summary.debts.maxInterest.interestRate.toFixed(2)}% a.m.` : '—'}
          </div>
          <div className="hl-name">{summary?.debts?.maxInterest?.name || '—'}</div>
        </div>
        <div className="highlight-card">
          <div className="hl-label">🏦 Maior dívida</div>
          <div className="hl-value text-red">{formatCurrency(summary?.debts?.maxTotal?.totalDebt)}</div>
          <div className="hl-name">{summary?.debts?.maxTotal?.name || '—'}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Gastos por categoria */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>🥧 Gastos por categoria</div>
          {catLabels.length > 0 ? (
            <>
              <div style={{ height: 220 }}>
                <Doughnut
                  data={{ labels: catLabels, datasets: [{ data: catValues, backgroundColor: catColors, borderWidth: 2, borderColor: '#fff' }] }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {catLabels.map((l, i) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: catColors[i], display: 'inline-block' }} />
                    {l}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🥧</div><div className="empty-state-text">Nenhum gasto registrado</div></div>
          )}
        </div>

        {/* Entradas vs Saídas */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>📊 Entradas vs Saídas</div>
          <div style={{ height: 220 }}>
            <Bar
              data={{
                labels: ['Entradas', 'Saídas', 'Fixas'],
                datasets: [{
                  data: [summary?.income?.total || 0, summary?.expense?.total || 0, summary?.fixed?.total || 0],
                  backgroundColor: ['#1D9E75', '#D85A30', '#BA7517'],
                  borderRadius: 8, borderWidth: 0,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { callback: (v) => 'R$' + (v / 1000).toFixed(1) + 'k' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>

          {/* Comprometimento */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Comprometimento da renda</span>
              <span style={{ fontWeight: 700, color: (summary?.commitmentRate || 0) > 80 ? 'var(--color-red)' : 'var(--color-green)' }}>
                {summary?.commitmentRate || 0}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${Math.min(100, summary?.commitmentRate || 0)}%`,
                background: (summary?.commitmentRate || 0) > 80 ? 'var(--color-red)' : (summary?.commitmentRate || 0) > 60 ? 'var(--color-amber)' : 'var(--color-green)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Próximas entradas futuras */}
      {summary?.upcoming?.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>📅 Próximos lançamentos</div>
          {summary.upcoming.map((f) => (
            <div key={f._id} className="tx-row">
              <div className="tx-icon" style={{ background: f.type === 'income' ? '#EAF3DE' : '#FAECE7' }}>
                {f.type === 'income' ? '📈' : '📉'}
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-name">{f.name}</div>
                <div className="tx-meta">{new Date(f.expectedDate).toLocaleDateString('pt-BR')}</div>
              </div>
              <span className={`badge ${f.type === 'income' ? 'badge-green' : 'badge-red'}`}>{formatCurrency(f.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && <EntryModal onClose={() => { setShowModal(false); fetchSummary(); }} />}
    </div>
  );
}
