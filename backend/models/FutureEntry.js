const mongoose = require('mongoose');

const FutureEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    expectedDate: { type: Date, required: true },
    realized: { type: Boolean, default: false }, // se já aconteceu
    realizedDate: { type: Date },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

FutureEntrySchema.index({ user: 1, expectedDate: 1 });
FutureEntrySchema.index({ user: 1, realized: 1 });

module.exports = mongoose.model('FutureEntry', FutureEntrySchema);
