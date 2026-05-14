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

  // Comprometimento
  if (rate > 90) {
    insights.push({ type: 'danger', icon: '🚨', title: 'Renda quase totalmente comprometida', text: `${rate}% da sua renda está comprometida. Isso é crítico — revise seus gastos imediatamente.` });
  } else if (rate > 80) {
    insights.push({ type: 'warning', icon: '⚠️', title: 'Alta comprometimento de renda', text: `${rate}% da sua renda está comprometida. O ideal é manter abaixo de 70%.` });
  } else if (rate > 60) {
    insights.push({ type: 'info', icon: 'ℹ️', title: 'Comprometimento moderado', text: `${rate}% comprometido. Ainda há margem, mas fique atento aos gastos variáveis.` });
  } else if (income > 0) {
    insights.push({ type: 'success', icon: '✅', title: 'Comprometimento saudável', text: `Apenas ${rate}% da sua renda está comprometida. Ótimo controle financeiro!` });
  }

  // Saldo livre
  if (freeCash > 0 && income > 0) {
    const savingsPct = Math.round((freeCash / income) * 100);
    if (savingsPct >= 20) {
      insights.push({ type: 'success', icon: '🐷', title: 'Bom potencial de poupança', text: `Você tem ${formatCurrency(freeCash)} livres por mês (${savingsPct}% da renda). Invista esse valor!` });
    } else if (savingsPct > 0) {
      insights.push({ type: 'info', icon: '💰', title: 'Algum espaço para poupança', text: `${formatCurrency(freeCash)} livres por mês (${savingsPct}%). Tente aumentar para pelo menos 20%.` });
    }
  } else if (freeCash < 0) {
    insights.push({ type: 'danger', icon: '❌', title: 'Deficit financeiro', text: `Suas despesas superam a renda em ${formatCurrency(Math.abs(freeCash))}. Isso é insustentável.` });
  }

  // Dívidas com juros altos
  const highInterestDebts = debts.filter(d => d.interestRate >= 5);
  if (highInterestDebts.length > 0) {
    insights.push({ type: 'danger', icon: '💳', title: 'Dívidas com juros altos', text: `Você tem ${highInterestDebts.length} dívida(s) com juros acima de 5% a.m. Priorize quitar: ${highInterestDebts.map(d => d.name).join(', ')}.` });
  }

  // Sem entradas
  if (income === 0) {
    insights.push({ type: 'info', icon: '📥', title: 'Nenhuma entrada registrada', text: 'Registre suas entradas para ter uma visão completa das suas finanças.' });
  }

  const colors = {
    danger: { bg: '#FCEBEB', border: '#F09595', text: '#A32D2D' },
    warning: { bg: '#FAEEDA', border: '#FAC775', text: '#854F0B' },
    success: { bg: '#EAF3DE', border: '#C0DD97', text: '#3B6D11' },
    info: { bg: '#E6F1FB', border: '#B5D4F4', text: '#185FA5' },
  };

  // Regra 50-30-20
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
            <div className="empty-state-icon">💡</div>
            <div className="empty-state-text">Adicione lançamentos para ver análises personalizadas.</div>
          </div>
        </div>
      ) : (
        insights.map((ins, i) => (
          <div key={i} className="card" style={{ marginBottom: 12, background: colors[ins.type].bg, borderColor: colors[ins.type].border }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{ins.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: colors[ins.type].text, marginBottom: 4 }}>{ins.title}</div>
                <p style={{ fontSize: 13, color: colors[ins.type].text, lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Regra 50-30-20 */}
      {income > 0 && (
        <div className="card" style={{ marginTop: 4 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>📐 Regra 50-30-20</div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            O ideal é: 50% para necessidades, 30% para desejos, 20% para poupança.
          </p>
          {[
            { label: 'Necessidades (fixas)', value: needs, target: income * 0.5, color: 'var(--color-blue)' },
            { label: 'Desejos (variáveis)', value: wants, target: income * 0.3, color: 'var(--color-amber)' },
            { label: 'Poupança / investimento', value: savings, target: income * 0.2, color: 'var(--color-green)' },
          ].map((row) => {
            const pct = income > 0 ? Math.round((row.value / income) * 100) : 0;
            const targetPct = Math.round((row.target / income) * 100);
            const isOk = row.value <= row.target;
            return (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: isOk ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {formatCurrency(row.value)} ({pct}% / meta {targetPct}%) {isOk ? '✓' : '↑'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: isOk ? row.color : 'var(--color-red)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
