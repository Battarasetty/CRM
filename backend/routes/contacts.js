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

module.exports = router;