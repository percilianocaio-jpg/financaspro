const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const FixedExpense = require('../models/FixedExpense');
const Debt = require('../models/Debt');
const FutureEntry = require('../models/FutureEntry');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/summary?month=5&year=2025
router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Transações do mês
    const transactions = await Transaction.find({ user: userId, date: { $gte: start, $lte: end } });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Gastos por categoria
    const byCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    // Maior entrada e maior gasto
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    const maxIncome = incomes.length ? incomes.reduce((a, b) => a.amount > b.amount ? a : b) : null;
    const maxExpense = expenses.length ? expenses.reduce((a, b) => a.amount > b.amount ? a : b) : null;

    // Despesas fixas ativas
    const fixed = await FixedExpense.find({ user: userId, active: true });
    const totalFixed = fixed.reduce((s, f) => s + f.amount, 0);

    // Dívidas ativas
    const debts = await Debt.find({ user: userId, active: true }).sort({ interestRate: -1 });
    const totalDebt = debts.reduce((s, d) => s + d.totalDebt, 0);
    const maxInterestDebt = debts.length ? debts[0] : null;
    const maxTotalDebt = debts.length ? debts.reduce((a, b) => a.totalDebt > b.totalDebt ? a : b) : null;

    // Futuros próximos (30 dias)
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 30);
    const upcoming = await FutureEntry.find({
      user: userId,
      realized: false,
      expectedDate: { $gte: new Date(), $lte: futureEnd },
    }).sort({ expectedDate: 1 });

    // Taxa de comprometimento
    const totalCommitted = totalExpense + totalFixed + debts.reduce((s, d) => s + d.monthlyPayment, 0);
    const commitmentRate = totalIncome > 0 ? Math.round((totalCommitted / totalIncome) * 100) : 0;

    res.json({
      period: { month, year },
      income: { total: totalIncome, count: incomes.length, max: maxIncome },
      expense: { total: totalExpense, count: expenses.length, max: maxExpense },
      balance: totalIncome - totalExpense,
      byCategory,
      fixed: { items: fixed, total: totalFixed },
      debts: {
        items: debts,
        total: totalDebt,
        maxInterest: maxInterestDebt,
        maxTotal: maxTotalDebt,
      },
      upcoming,
      commitmentRate,
      freeCash: totalIncome - totalCommitted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
