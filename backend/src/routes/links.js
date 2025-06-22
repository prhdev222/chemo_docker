const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// GET all links - accessible by all authenticated users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const links = await prisma.externalLink.findMany({
            orderBy: { createdAt: 'asc' }
        });
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch links.' });
    }
});

// POST a new link - Admin only
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { title, url } = req.body;
    if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required.' });
    }
    try {
        const newLink = await prisma.externalLink.create({
            data: { title, url }
        });
        res.status(201).json(newLink);
    } catch (error) {
        res.status(500).json({ error: 'Could not create link.' });
    }
});

// PUT (update) a link - Admin only
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { id } = req.params;
    const { title, url } = req.body;
    if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required.' });
    }
    try {
        const updatedLink = await prisma.externalLink.update({
            where: { id: parseInt(id) },
            data: { title, url }
        });
        res.json(updatedLink);
    } catch (error) {
        res.status(500).json({ error: 'Could not update link.' });
    }
});

// DELETE a link - Admin only
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.externalLink.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ error: 'Could not delete link.' });
    }
});

module.exports = router; 