const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/transactions  →  lista com filtros opcionais
// query: month (1-12), year, type, category
router.get('/', async (req, res) => {
  try {
    const { month, year, type, category } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      filter.date = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) };
    }

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { name, amount, type, category, date, notes } = req.body;
    if (!name || !amount || !type || !category || !date)
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

    const transaction = await Transaction.create({
      user: req.user._id, name, amount, type, category, date, notes,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Lançamento não encontrado.' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Lançamento não encontrado.' });
    res.json({ message: 'Removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
