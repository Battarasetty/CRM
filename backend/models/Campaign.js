const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Email', 'SMS', 'Push', 'Social'], default: 'Email' },
    status: { type: String, enum: ['Draft', 'Scheduled', 'Active', 'Completed'], default: 'Draft' },
    segment: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
    subject: { type: String },
    content: { type: String },
    budget: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    abTest: {
        enabled: { type: Boolean, default: false },
        variantA: { type: String },
        variantB: { type: String },
    },
    analytics: {
        sent: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 },
        unsubscribed: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);