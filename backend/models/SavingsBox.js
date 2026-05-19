const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
  type: { type: String, enum: ['deposit', 'withdrawal', 'yield'], required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, default: '' },
  balanceAfter: { type: Number, required: true }, // saldo após o movimento
});

const SavingsBoxSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    goal: { type: Number, default: null },           // meta em R$
    objective: { type: String, trim: true, default: '' }, // ex: "Viagem para Europa"
    color: { type: String, default: '#1D9E75' },
    emoji: { type: String, default: '🏦' },
    currentBalance: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalYield: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    movements: [MovementSchema],
  },
  { timestamps: true }
);

SavingsBoxSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('SavingsBox', SavingsBoxSchema);
