const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';
    const items = await Debt.find(filter).sort({ interestRate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Debt.create({ user: req.user._id, ...req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Debt.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Dívida não encontrada.' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Debt.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Dívida não encontrada.' });
    res.json({ message: 'Removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
