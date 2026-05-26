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
    'Manutenção carro', 'Manutenção casa', 'Cartão de crédito', 'Outros',
  ],
  fixed: [
    'Moradia', 'Internet/Tel', 'Saúde', 'Educação', 'Transporte',
    'Manutenção carro', 'Manutenção casa', 'Assinaturas', 'Cartão de crédito', 'Outros',
  ],
  debt: ['Cartão de crédito', 'Empréstimo pessoal', 'Financiamento', 'Cheque especial', 'Outros'],
};

export const CAT_COLORS = {
  'Salário': '#C9A84C',
  'Freelance': '#8A6E2F',
  'Outros rendimentos': '#E8C97A',
  'Alimentação': '#D95F3B',
  'Transporte': '#C4892A',
  'Moradia': '#C9A84C',
  'Internet/Tel': '#8A6E2F',
  'Saúde': '#D95F3B',
  'Educação': '#E8C97A',
  'Lazer': '#A07838',
  'Manutenção carro': '#C4892A',
  'Manutenção casa': '#8A6E2F',
  'Supermercado': '#C9A84C',
  'Cartão de crédito': '#D95F3B',
  'Assinaturas': '#8A6E2F',
  'Outros': '#4A4845',
};

export const CAT_ICONS = {
  'Salário': 'ti-briefcase',
  'Freelance': 'ti-code',
  'Outros rendimentos': 'ti-coin',
  'Alimentação': 'ti-tools-kitchen-2',
  'Transporte': 'ti-car',
  'Moradia': 'ti-home',
  'Internet/Tel': 'ti-wifi',
  'Saúde': 'ti-heart',
  'Educação': 'ti-school',
  'Lazer': 'ti-confetti',
  'Manutenção carro': 'ti-tool',
  'Manutenção casa': 'ti-hammer',
  'Supermercado': 'ti-shopping-cart',
  'Cartão de crédito': 'ti-credit-card',
  'Assinaturas': 'ti-device-mobile',
  'Empréstimo pessoal': 'ti-building-bank',
  'Financiamento': 'ti-file-invoice',
  'Cheque especial': 'ti-alert-triangle',
  'Outros': 'ti-dots',
};