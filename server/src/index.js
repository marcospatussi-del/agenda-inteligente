require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initCronJobs } = require('./services/cronService');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const confirmationRoutes = require('./routes/confirmationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/confirmations', confirmationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    name: 'Agenda Inteligente API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Start Server & Cron
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Agenda Inteligente rodando na porta ${PORT}`);
    initCronJobs();
  });
}

module.exports = app;
