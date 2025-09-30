const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();




// Import des routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/controlOrders');
const defectRoutes = require('./routes/defects');
const productionLineRoutes = require('./routes/productionLines');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'sql110.infinityfree.com',
    user: process.env.DB_USER || 'if0_40054476',
    password: process.env.DB_PASSWORD || 'AhmedKaroui1995',
    database: process.env.DB_NAME || 'if0_40054476_simotex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make db available in routes
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// API documentation route
app.get('/api', (req, res) => {
    res.json({
        message: 'SIMOTEX API is running',
        endpoints: {
            auth: '/api/auth',
            orders: '/api/orders',
            defects: '/api/defects',
            chaines: '/api/chaines'
        }
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/chaines', productionLineRoutes);
app.use('/api/production-lines', require('./routes/productionLines'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404s
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else if (req.path.endsWith('.html')) {
        res.sendFile(path.join(__dirname, '..', req.path), err => {
            if (err) {
                res.status(404).sendFile(path.join(__dirname, '..', 'login.html'));
            }
        });
    } else {
        res.sendFile(path.join(__dirname, '..', 'login.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
