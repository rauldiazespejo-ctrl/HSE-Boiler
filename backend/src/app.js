const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middlewares
app.use(helmet());
app.use(
  cors(
    corsOrigins.length
      ? {
          origin: corsOrigins,
        }
      : undefined
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'HSE Maestranza API is running' });
});

const authRoutes = require('./routes/authRoutes');
const documentoRoutes = require('./routes/documentoRoutes');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documentos', documentoRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  void next;
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
