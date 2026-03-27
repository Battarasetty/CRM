const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String },
  age: { type: Number },
  tags: [String],
  isUnsubscribed: { type: Boolean, default: false },
  lastPurchaseDate: { type: Date },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  company: { type: String },
  jobTitle: { type: String },
  industry: { type: String },
  enrichedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);