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

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error code:', err.code);
    process.exit(1); // Exit if database connection fails
  }
  
  console.log('✅ Database connected successfully');
  console.log(`📊 Connected to database: ${process.env.DB_NAME || 'simotex'}`);
  console.log(`🖥️  Host: ${process.env.DB_HOST || 'localhost'}`);
  
  connection.release(); // Release the connection back to the pool
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Make db available in routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});


// Root endpoint - show app status
app.get('/', (req, res) => {
    res.send('<h1>✅ Application is running!</h1><p>Welcome to SIMOTEX backend server.</p>');
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
