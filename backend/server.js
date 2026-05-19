const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

// Garante que a pasta de uploads temporários existe
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://financaspro-brown.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/fixed', require('./routes/fixed'));
app.use('/api/future', require('./routes/future'));
app.use('/api/debts', require('./routes/debts'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/import', require('./routes/import'));
app.use('/api/savings', require('./routes/savings'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });