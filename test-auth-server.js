const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Simple login route
app.post('/api/auth/login', (req, res) => {
    const { name, role } = req.body;
    console.log('Login attempt:', { name, role });

    // Generate a simple token
    const token = jwt.sign(
        { name, role },
        'test-secret',
        { expiresIn: '24h' }
    );

    res.json({ token, user: { name, role } });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Try these endpoints:');
    console.log('1. GET  http://localhost:3000/api');
    console.log('2. POST http://localhost:3000/api/auth/login');
});
