const express = require('express');
const router = express.Router();
const FutureEntry = require('../models/FutureEntry');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { realized } = req.query;
    const filter = { user: req.user._id };
    if (realized !== undefined) filter.realized = realized === 'true';
    const items = await FutureEntry.find(filter).sort({ expectedDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await FutureEntry.create({ user: req.user._id, ...req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Marcar como realizado
router.patch('/:id/realize', async (req, res) => {
  try {
    const item = await FutureEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { realized: true, realizedDate: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await FutureEntry.findOneAndUpdate(
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
    const item = await FutureEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json({ message: 'Removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
