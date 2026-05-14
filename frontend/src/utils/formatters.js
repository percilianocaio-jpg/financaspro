export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00' : ''));
  return d.toLocaleDateString('pt-BR');
};

export const formatMonth = (month, year) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const currentMonth = () => new Date().getMonth() + 1;
export const currentYear = () => new Date().getFullYear();

export const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Outros rendimentos'],
  expense: [
    'Alimentação', 'Supermercado', 'Transporte', 'Moradia',
    'Internet/Tel', 'Saúde', 'Educação', 'Lazer',
    'Manutenção carro', 'Manutenção casa', 'Cartão de crédito', 'Outros'
  ],
  fixed: [
    'Moradia', 'Internet/Tel', 'Saúde', 'Educação', 'Transporte',
    'Manutenção carro', 'Manutenção casa', 'Assinaturas', 'Cartão de crédito', 'Outros'
  ],
  debt: ['Cartão de crédito', 'Empréstimo pessoal', 'Financiamento', 'Cheque especial', 'Outros'],
};

export const CAT_COLORS = {
  'Salário': '#1D9E75', 'Freelance': '#0F6E56', 'Outros rendimentos': '#5DCAA5',
  'Alimentação': '#D85A30', 'Transporte': '#BA7517', 'Moradia': '#185FA5',
  'Internet/Tel': '#534AB7', 'Saúde': '#D4537E', 'Educação': '#378ADD',
  'Lazer': '#639922', 'Manutenção carro': '#E24B4A', 'Manutenção casa': '#993C1D',
  'Supermercado': '#EF9F27', 'Cartão de crédito': '#A32D2D', 'Outros': '#888780',
  'Assinaturas': '#534AB7', 'Empréstimo pessoal': '#D85A30',
  'Financiamento': '#BA7517', 'Cheque especial': '#E24B4A',
};

export const CAT_ICONS = {
  'Salário': '💼', 'Freelance': '💻', 'Outros rendimentos': '💰',
  'Alimentação': '🍽️', 'Transporte': '🚗', 'Moradia': '🏠',
  'Internet/Tel': '📡', 'Saúde': '❤️', 'Educação': '📚',
  'Lazer': '🎉', 'Manutenção carro': '🔧', 'Manutenção casa': '🔨',
  'Supermercado': '🛒', 'Cartão de crédito': '💳', 'Outros': '📌',
  'Assinaturas': '📱', 'Empréstimo pessoal': '🏦',
  'Financiamento': '📄', 'Cheque especial': '⚠️',
};
