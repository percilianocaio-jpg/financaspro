const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Salário', 'Freelance', 'Outros rendimentos',
        'Alimentação', 'Supermercado', 'Transporte', 'Moradia',
        'Internet/Tel', 'Saúde', 'Educação', 'Lazer',
        'Manutenção carro', 'Manutenção casa', 'Cartão de crédito', 'Outros'
      ],
    },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Index para queries por usuário e data
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
