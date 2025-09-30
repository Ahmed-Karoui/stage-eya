const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/controlOrders');
const defectRoutes = require('./routes/defects');
const productionLineRoutes = require('./routes/productionLines');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ✅ Database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'if0_40054476',
  password: process.env.DB_PASSWORD || 'AhmedKaroui1995',
  database: process.env.DB_NAME || 'if0_40054476_simotex',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Attach pool
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// ✅ Routes
app.get('/', (req, res) => {
  res.send('<h1>✅ Application is running!</h1><p>Welcome to SIMOTEX backend server.</p>');
});

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

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/chaines', productionLineRoutes);
app.use('/api/production-lines', productionLineRoutes);

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Export the Express app instead of listening
module.exports = app;
