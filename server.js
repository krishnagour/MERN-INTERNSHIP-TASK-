const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');
const { Transaction } = require('./models/transaction');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactionsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize database with seed data
async function initializeDatabase() {
  const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  const data = await response.json();
  
  await Transaction.deleteMany({});
  await Transaction.insertMany(data);
  console.log('Database initialized');
}

initializeDatabase();
