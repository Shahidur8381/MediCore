const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initialize, executeQuery } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Basic health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await executeQuery(`SELECT 'Database connected successfully' AS status FROM DUAL`);
    res.json({
      status: 'API is running',
      db_status: result.rows[0].STATUS
    });
  } catch (err) {
    res.status(500).json({
      status: 'API is running, but database connection failed',
      error: err.message
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/lab', require('./routes/lab'));
app.use('/api/financial', require('./routes/financial'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize DB pool FIRST, then start listening
async function start() {
  const poolReady = await initialize();
  if (!poolReady) {
    console.error('Cannot start server without database. Exiting.');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`MediCore API server running on port ${PORT}`);
  });
}

start();
