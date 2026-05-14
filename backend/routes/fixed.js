const express = require('express');
const router = express.Router();
const FixedExpense = require('../models/FixedExpense');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = { user: req.user._id };
    if (active !== undefined) filter.active = active === 'true';
    const items = await FixedExpense.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await FixedExpense.create({ user: req.user._id, ...req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await FixedExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await FixedExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json({ message: 'Removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
