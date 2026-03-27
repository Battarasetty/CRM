const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { sendCampaignEmail, sendTestEmail } = require('../utils/mailer');

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

router.post('/', auth, async (req, res) => {
  try {
    const campaignData = { ...req.body };
    if (!campaignData.segment || campaignData.segment === '') {
      campaignData.segment = null;
    }
    const campaign = await Campaign.create(campaignData);
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

router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segment');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    let contacts = [];

    if (campaign.segment) {
      const segmentDoc = await Segment.findById(campaign.segment._id);
      const filter = { isUnsubscribed: false };
      if (segmentDoc?.filters?.city) filter.city = segmentDoc.filters.city;
      if (segmentDoc?.filters?.minAge) filter.age = { $gte: segmentDoc.filters.minAge };
      if (segmentDoc?.filters?.minSpent) filter.totalSpent = { $gte: segmentDoc.filters.minSpent };
      contacts = await Contact.find(filter);
    } else {
      // No segment — send to all active contacts
      contacts = await Contact.find({ isUnsubscribed: false });
    }

    let sentCount = 0;
    for (const contact of contacts) {
      try {
        await sendCampaignEmail(contact.email, campaign.subject, campaign.content, campaign._id, contact._id);
        sentCount++;
      } catch (emailErr) {
        console.log(`Failed to send to ${contact.email}:`, emailErr.message);
      }
    }

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
    const ua = req.headers['user-agent'] || '';
    const isMobile = /mobile/i.test(ua);
    const isTablet = /tablet|ipad/i.test(ua);
    const deviceKey = isTablet ? 'analytics.devices.tablet' : isMobile ? 'analytics.devices.mobile' : 'analytics.devices.desktop';

    // Get contact city
    const Contact = require('../models/Contact');
    const contact = await Contact.findById(req.params.contactId);
    const city = contact?.city || 'Unknown';

    await Campaign.findByIdAndUpdate(req.params.id, {
      $inc: {
        'analytics.opened': 1,
        [deviceKey]: 1,
        [`analytics.cities.${city}`]: 1,
      }
    });

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

// Send test email
router.post('/send-test', auth, async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    if (!to || !subject || !content) {
      return res.status(400).json({ message: 'to, subject and content are required' });
    }
    await sendTestEmail(to, subject, content);
    res.json({ message: `Test email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email: ' + err.message });
  }
});

module.exports = router;