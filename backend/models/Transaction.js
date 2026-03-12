const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: Date, required: true },
  description: { type: String, required: true },
  amount:      { type: Number, required: true },
  type:        { type: String, enum: ['credit', 'debit'], required: true },
  category:    { type: String, default: 'Others' },
  balance:     { type: Number },           // running balance from bank statement
  uploadId:    { type: String },           // groups transactions from same upload
  createdAt:   { type: Date, default: Date.now }
});

//  Indexes for fast filtering, searching, and sorting
transactionSchema.index({ user: 1, date: -1 });           // user's transactions sorted by date
transactionSchema.index({ user: 1, category: 1 });         // category filter
transactionSchema.index({ user: 1, type: 1 });             // debit/credit filter
transactionSchema.index({ user: 1, uploadId: 1 });         // fetch by upload batch
transactionSchema.index({ description: 'text' });          // text search on description

module.exports = mongoose.model('Transaction', transactionSchema);