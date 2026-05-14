const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Cartão de crédito', 'Empréstimo pessoal', 'Financiamento', 'Cheque especial', 'Outros'],
      required: true,
    },
    totalDebt: { type: Number, required: true, min: 0 },       // valor total da dívida
    monthlyPayment: { type: Number, required: true, min: 0 },  // parcela mensal
    interestRate: { type: Number, default: 0, min: 0 },        // % a.m.
    remainingInstallments: { type: Number, default: null },     // parcelas restantes
    dueDay: { type: Number, min: 1, max: 31, default: 1 },
    active: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

DebtSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Debt', DebtSchema);
