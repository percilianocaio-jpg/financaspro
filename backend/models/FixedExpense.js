const mongoose = require('mongoose');

const FixedExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        'Moradia', 'Internet/Tel', 'Saúde', 'Educação',
        'Transporte', 'Manutenção carro', 'Manutenção casa',
        'Assinaturas', 'Cartão de crédito', 'Outros'
      ],
    },
    dueDay: { type: Number, min: 1, max: 31, default: 1 }, // dia do vencimento
    active: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

FixedExpenseSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('FixedExpense', FixedExpenseSchema);
