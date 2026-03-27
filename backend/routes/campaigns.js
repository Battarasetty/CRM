const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { sendCampaignEmail } = require('../utils/mailer');

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('segment').sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segment');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create campaign
router.post('/', auth, async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEND campaign — fires emails to all contacts in segment
router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segment');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    // Get contacts in segment
    const segmentDoc = await Segment.findById(campaign.segment._id);
    const contacts = await Contact.find({
      isUnsubscribed: false,
      ...(segmentDoc.filters.city && { city: segmentDoc.filters.city }),
    });

    // Send emails
    let sentCount = 0;
    for (const contact of contacts) {
      await sendCampaignEmail(contact.email, campaign.subject, campaign.content, contact._id);
      sentCount++;
    }

    // Update analytics
    campaign.analytics.sent = sentCount;
    campaign.status = 'Active';
    await campaign.save();

    res.json({ message: `Campaign sent to ${sentCount} contacts`, campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track email open (pixel tracking)
router.get('/:id/track/open/:contactId', async (req, res) => {
  try {
    await Campaign.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.opened': 1 } });
    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length });
    res.end(pixel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track email click
router.get('/:id/track/click/:contactId', async (req, res) => {
  try {
    await Campaign.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.clicked': 1 } });
    res.redirect(req.query.url || 'http://localhost:3000');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;