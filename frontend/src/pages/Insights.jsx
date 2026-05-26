import { useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

export default function Insights() {
  const { summary, fetchSummary } = useFinance();
  useEffect(() => { fetchSummary(); }, []);

  const rate = summary?.commitmentRate || 0;
  const freeCash = summary?.freeCash || 0;
  const income = summary?.income?.total || 0;
  const debts = summary?.debts?.items || [];

  const insights = [];

  if (rate > 90) insights.push({ type: 'danger', icon: 'ti-alert-octagon', title: 'Renda quase totalmente comprometida', text: `${rate}% da sua renda está comprometida. Revise seus gastos imediatamente.` });
  else if (rate > 80) insights.push({ type: 'warning', icon: 'ti-alert-triangle', title: 'Alto comprometimento de renda', text: `${rate}% comprometido. O ideal é manter abaixo de 70%.` });
  else if (rate > 60) insights.push({ type: 'info', icon: 'ti-info-circle', title: 'Comprometimento moderado', text: `${rate}% comprometido. Ainda há margem, mas fique atento.` });
  else if (income > 0) insights.push({ type: 'success', icon: 'ti-circle-check', title: 'Comprometimento saudável', text: `Apenas ${rate}% da sua renda está comprometida. Ótimo controle financeiro!` });

  if (freeCash > 0 && income > 0) {
    const pct = Math.round((freeCash / income) * 100);
    if (pct >= 20) insights.push({ type: 'success', icon: 'ti-pig-money', title: 'Bom potencial de poupança', text: `Você tem ${formatCurrency(freeCash)} livres por mês (${pct}% da renda). Considere investir!` });
    else insights.push({ type: 'info', icon: 'ti-coin', title: 'Algum espaço para poupança', text: `${formatCurrency(freeCash)} livres (${pct}%). Tente aumentar para pelo menos 20%.` });
  } else if (freeCash < 0) {
    insights.push({ type: 'danger', icon: 'ti-trending-down', title: 'Déficit financeiro', text: `Suas despesas superam a renda em ${formatCurrency(Math.abs(freeCash))}. Insustentável a longo prazo.` });
  }

  const highInterest = debts.filter(d => d.interestRate >= 5);
  if (highInterest.length > 0) insights.push({ type: 'danger', icon: 'ti-credit-card', title: 'Dívidas com juros altos', text: `${highInterest.length} dívida(s) com juros acima de 5% a.m. Priorize: ${highInterest.map(d => d.name).join(', ')}.` });

  if (income === 0) insights.push({ type: 'info', icon: 'ti-arrow-down', title: 'Nenhuma entrada registrada', text: 'Registre suas entradas para ter uma visão completa das finanças.' });

  const typeConfig = {
    danger: { border: 'rgba(217,95,59,0.3)', bg: 'rgba(217,95,59,0.06)', color: 'var(--negative)' },
    warning: { border: 'rgba(196,137,42,0.3)', bg: 'rgba(196,137,42,0.06)', color: 'var(--warning)' },
    success: { border: 'rgba(61,170,106,0.3)', bg: 'rgba(61,170,106,0.06)', color: 'var(--positive)' },
    info: { border: 'rgba(201,168,76,0.25)', bg: 'var(--gold-bg)', color: 'var(--gold)' },
  };

  const needs = summary?.fixed?.total || 0;
  const wants = summary?.expense?.total || 0;
  const savings = freeCash > 0 ? freeCash : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Insights Financeiros</h1>
          <p className="page-subtitle">Análise automática das suas finanças</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="ti ti-bulb" /></div>
            <div className="empty-state-title">Nenhum insight disponível</div>
            <div className="empty-state-sub">Adicione lançamentos para ver análises personalizadas</div>
          </div>
        </div>
      ) : (
        insights.map((ins, i) => {
          const c = typeConfig[ins.type];
          return (
            <div key={i} className="card" style={{ marginBottom: 10, borderColor: c.border, background: c.bg }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <i className={`ti ${ins.icon}`} style={{ fontSize: 20, color: c.color, marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: c.color, marginBottom: 4, fontSize: 13 }}>{ins.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.text}</p>
                </div>
              </div>
            </div>
          );
        })
      )}

      {income > 0 && (
        <div className="card" style={{ marginTop: 4 }}>
          <div className="card-title"><span>Regra 50-30-20</span></div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
            O ideal é: 50% para necessidades, 30% para desejos, 20% para poupança/investimento.
          </p>
          {[
            { label: 'Necessidades (fixas)', value: needs, target: income * 0.5, color: 'var(--gold)' },
            { label: 'Desejos (variáveis)', value: wants, target: income * 0.3, color: 'var(--warning)' },
            { label: 'Poupança / investimento', value: savings, target: income * 0.2, color: 'var(--positive)' },
          ].map(row => {
            const pct = income > 0 ? Math.round((row.value / income) * 100) : 0;
            const targetPct = Math.round((row.target / income) * 100);
            const isOk = row.value <= row.target;
            return (
              <div key={row.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: isOk ? 'var(--positive)' : 'var(--negative)', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(row.value)} · {pct}% <span style={{ color: 'var(--text-muted)' }}>/ meta {targetPct}%</span> {isOk ? '✓' : '↑'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: isOk ? row.color : 'var(--negative)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
