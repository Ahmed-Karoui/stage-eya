const mysql = require('mysql2/promise');
const express = require('express');
require('dotenv').config();

async function testConnection() {
    try {
        const pool = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'eya123eya123',
            database: process.env.DB_NAME || 'simotex'
        });

        // Test the connection
        const [result] = await pool.query('SELECT 1');
        console.log('Database connection successful!');
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

const app = express();
app.use(express.json());

// Basic test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
    try {
        const pool = await testConnection();
        const [rows] = await pool.query('SELECT * FROM users LIMIT 1');
        res.json({
            message: 'Database connection successful',
            sample_data: rows
        });
    } catch (error) {
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Try accessing:');
    console.log('1. http://localhost:3000/api');
    console.log('2. http://localhost:3000/api/test-db');
});
