const express = require('express');
const router = express.Router();
const Segment = require('../models/Segment');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Helper — build mongo filter from segment filters
const buildFilter = (filters) => {
  const query = { isUnsubscribed: false };
  if (filters.city) query.city = filters.city;
  if (filters.minAge) query.age = { ...query.age, $gte: filters.minAge };
  if (filters.maxAge) query.age = { ...query.age, $lte: filters.maxAge };
  if (filters.minSpent) query.totalSpent = { $gte: filters.minSpent };
  if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
  if (filters.inactiveDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filters.inactiveDays);
    query.lastPurchaseDate = { $lte: cutoff };
  }
  return query;
};

// Get all segments
router.get('/', auth, async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json(segments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Preview segment size before saving
router.post('/preview', auth, async (req, res) => {
  try {
    const filter = buildFilter(req.body.filters || {});
    const count = await Contact.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create segment
router.post('/', auth, async (req, res) => {
  try {
    const filter = buildFilter(req.body.filters || {});
    const count = await Contact.countDocuments(filter);
    const segment = await Segment.create({ ...req.body, contactCount: count });
    res.status(201).json(segment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contacts belonging to a segment
router.get('/:id/contacts', auth, async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ message: 'Segment not found' });
    const filter = buildFilter(segment.filters || {});
    const contacts = await Contact.find(filter);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete segment
router.delete('/:id', auth, async (req, res) => {
  try {
    await Segment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Segment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;