const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { name, role } = req.body;
        console.log('Login attempt:', { name, role }); // Debug log

        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }

        // Validate role
        const validRoles = ['RCE', 'CE', 'CHC', 'RP', 'RCPF'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user exists or create new user
        const [users] = await db.query(
            'SELECT * FROM users WHERE name = ? AND role = ?',
            [name, role]
        );

        let userId;
        if (users.length === 0) {
            // Create new user with current timestamp
            const [result] = await db.query(
                'INSERT INTO users (name, role, cnx) VALUES (?, ?, NOW())',
                [name, role]
            );
            userId = result.insertId;
        } else {
            userId = users[0].id;
            // Update connection timestamp
            await db.query(
                'UPDATE users SET cnx = NOW() WHERE id = ?',
                [userId]
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: userId, name, role },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: userId, name, role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
