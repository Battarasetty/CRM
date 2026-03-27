const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Get all contacts
router.get('/', auth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create contact
router.post('/', auth, async (req, res) => {
    try {
        const existing = await Contact.findOne({ email: req.body.email });
        if (existing) return res.status(400).json({ message: 'A contact with this email already exists' });
        const contact = await Contact.create(req.body);
        res.status(201).json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Import bulk contacts
router.post('/bulk', auth, async (req, res) => {
    try {
        const contacts = await Contact.insertMany(req.body.contacts, { ordered: false });
        res.status(201).json({ message: `${contacts.length} contacts imported`, contacts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unsubscribe
router.put('/:id/unsubscribe', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { isUnsubscribed: true },
            { new: true }
        );
        res.json({ message: 'Unsubscribed successfully', contact });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Public lead capture form — no auth needed
router.post('/capture', async (req, res) => {
    try {
        const { name, email, phone, city } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
        const existing = await Contact.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });
        const contact = await Contact.create({ name, email, phone, city, tags: ['lead'] });
        res.status(201).json({ message: 'Thank you! We will be in touch.', contact });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Data enrichment — mock Clearbit style
router.post('/:id/enrich', auth, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        // Mock enrichment data based on email domain
        const domain = contact.email.split('@')[1];
        const enrichmentMap = {
            'gmail.com': { company: 'Individual', jobTitle: 'Consumer', industry: 'General' },
            'yahoo.com': { company: 'Individual', jobTitle: 'Consumer', industry: 'General' },
            'hotmail.com': { company: 'Individual', jobTitle: 'Consumer', industry: 'General' },
            'infosys.com': { company: 'Infosys', jobTitle: 'Engineer', industry: 'Technology' },
            'tcs.com': { company: 'TCS', jobTitle: 'Analyst', industry: 'Technology' },
            'wipro.com': { company: 'Wipro', jobTitle: 'Developer', industry: 'Technology' },
        };

        const enriched = enrichmentMap[domain] || {
            company: domain.split('.')[0].toUpperCase(),
            jobTitle: 'Professional',
            industry: 'Business',
        };

        // Add enrichment fields to contact
        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    company: enriched.company,
                    jobTitle: enriched.jobTitle,
                    industry: enriched.industry,
                    enrichedAt: new Date(),
                }
            },
            { new: true }
        );

        res.json({ message: 'Contact enriched successfully', contact: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;