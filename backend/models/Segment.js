const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    filters: {
        city: { type: String },
        minAge: { type: Number },
        maxAge: { type: Number },
        minSpent: { type: Number },
        tags: [String],
        inactiveDays: { type: Number },
    },
    contactCount: { type: Number, default: 0 },
    isDynamic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Segment', segmentSchema);