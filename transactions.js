const express = require('express');
const { Transaction } = require('../models/transaction');
const router = express.Router();

// Helper function to parse month
function getMonthNumber(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(month) + 1;
}

// Initialize the database
router.get('/initialize', async (req, res) => {
  try {
    // Call the function to initialize the database
    await initializeDatabase();
    res.status(200).send('Database initialized');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
});

// List all transactions with search and pagination
router.get('/', async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const monthNumber = getMonthNumber(month);
  const startDate = new Date(`2024-${monthNumber}-01`);
  const endDate = new Date(`2024-${monthNumber + 1}-01`);

  try {
    const query = {
      dateOfSale: { $gte: startDate, $lt: endDate },
      ...(search && { $or: [
        { 'product.title': new RegExp(search, 'i') },
        { 'product.description': new RegExp(search, 'i') },
        { 'product.price': new RegExp(search, 'i') }
      ] })
    };

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const total = await Transaction.countDocuments(query);

    res.json({ transactions, total });
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
});

// Statistics API
router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);
  const startDate = new Date(`2024-${monthNumber}-01`);
  const endDate = new Date(`2024-${monthNumber + 1}-01`);

  try {
    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate }, sold: true } },
      { $group: { _id: null, totalAmount: { $sum: '$product.price' }, totalItems: { $sum: 1 } } }
    ]);

    const totalNotSold = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      sold: false
    });

    res.json({
      totalAmount: totalSales[0]?.totalAmount || 0,
      totalSoldItems: totalSales[0]?.totalItems || 0,
      totalNotSoldItems: totalNotSold
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
});

// Bar Chart Data API
router.get('/bar-chart', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);
  const startDate = new Date(`2024-${monthNumber}-01`);
  const endDate = new Date(`2024-${monthNumber + 1}-01`);

  try {
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];

    const barChartData = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        dateOfSale: { $gte: startDate, $lt: endDate },
        'product.price': { $gte: range.min, $lte: range.max }
      });
      return { range: `${range.min} - ${range.max}`, count };
    }));

    res.json(barChartData);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
});

// Pie Chart Data API
router.get('/pie-chart', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);
  const startDate = new Date(`2024-${monthNumber}-01`);
  const endDate = new Date(`2024-${monthNumber + 1}-01`);

  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$product.category', count: { $sum: 1 } } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
});

// Combined API
router.get('/combined', async (req, res) => {
  const { month } = req.query;
  const [transactions, stats, barChartData, pieChartData] = await Promise.all([
    Transaction.find({ dateOfSale: { $gte: new Date(`2024-${getMonthNumber(month)}-01`), $lt: new Date(`2024-${getMonthNumber(month) + 1}-01`) } }),
    fetch(`http://localhost:5000/api/transactions/statistics?month=${month}`).then(res => res.json()),
    fetch(`http://localhost:5000/api/transactions/bar-chart?month=${month}`).then(res => res.json()),
    fetch(`http://localhost:5000/api/transactions/pie-chart?month=${month}`).then(res => res.json())
  ]);

  res.json({ transactions, stats, barChartData, pieChartData });
});

module.exports = router;
