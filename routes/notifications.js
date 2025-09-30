const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Middleware pour vérifier req.user
function requireUser(req, res, next) {
    if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({ error: 'User not authenticated properly' });
    }
    next();
}

// Get all notifications for a user's role
router.get('/', authenticateToken, requireUser, async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user);

        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE JSON_CONTAINS(target_roles, ?)
             AND (read_by IS NULL OR NOT JSON_CONTAINS(read_by, ?))
             ORDER BY created_at DESC`,
            [JSON.stringify(req.user.role), JSON.stringify(req.user.id)]
        );

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Create new notification
router.post('/', authenticateToken, requireUser, async (req, res) => {
    const { message, target_roles } = req.body;

    if (!message || !Array.isArray(target_roles)) {
        return res.status(400).json({ error: 'Message and target_roles array are required' });
    }

    try {
        console.log('Creating notification:', { message, target_roles });

        await db.query(
            'INSERT INTO notifications (message, target_roles) VALUES (?, ?)',
            [message, JSON.stringify(target_roles)]
        );

        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, requireUser, async (req, res) => {
    const { id } = req.params;

    try {
        console.log('Marking notification as read:', { notificationId: id, userId: req.user.id });

        await db.query(
            `UPDATE notifications 
             SET read_by = JSON_ARRAY_APPEND(
                 CASE 
                     WHEN read_by IS NULL OR JSON_VALID(read_by) = 0 THEN JSON_ARRAY()
                     ELSE read_by 
                 END, 
                 '$', ?
             )
             WHERE id = ?`,
            [req.user.id, id]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

module.exports = router;
