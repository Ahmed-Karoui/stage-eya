const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', req.body);
    }
    next();
});

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'eya123eya123',
    database: process.env.DB_NAME || 'simotex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Root API endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'API is working!',
        instructions: 'To login, make a POST request to /api/auth/login with name and role'
    });
});

// Login endpoint with detailed instructions
app.get('/api/auth/login', (req, res) => {
    res.json({
        message: 'This is a POST endpoint. Here is how to use it:',
        instructions: {
            method: 'POST',
            url: '/api/auth/login',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                name: 'your_name',
                role: 'CE' // or RCE, CHC, RP, RCPF
            }
        },
        example: {
            curl: 'curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\\"name\\":\\"test\\",\\"role\\":\\"CE\\"}"'
        }
    });
});

// Actual login endpoint
app.post('/api/auth/login', async (req, res) => {
    console.log('Login attempt received:', req.body);
    
    try {
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: { name: 'string', role: 'string' }
            });
        }

        // Validate role
        const validRoles = ['RCE', 'CE', 'CHC', 'RP', 'RCPF'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                validRoles
            });
        }

        // Check if user exists or create new user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE name = ? AND role = ?',
            [name, role]
        );

        let userId;
        if (users.length === 0) {
            const [result] = await pool.query(
                'INSERT INTO users (name, role, cnx) VALUES (?, ?, NOW())',
                [name, role]
            );
            userId = result.insertId;
            console.log('Created new user:', userId);
        } else {
            userId = users[0].id;
            await pool.query(
                'UPDATE users SET cnx = NOW() WHERE id = ?',
                [userId]
            );
            console.log('Updated existing user:', userId);
        }

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: userId, name, role },
            process.env.JWT_SECRET || '9e6985c6e89a11e14720ca8146b164bedd7301c30f0485ba0f913e4aeba9b1ad88dc12793210f6d25ab65fd72d8b9050d0bf38b1f9f835393ea763bb9201d29b',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: userId, name, role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Login test server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('1. GET  http://localhost:3000/api');
    console.log('2. GET  http://localhost:3000/api/auth/login (shows instructions)');
    console.log('3. POST http://localhost:3000/api/auth/login (actual login endpoint)');
});
