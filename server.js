const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const multer = require('multer');
const cors = require('cors');
const { db } = require('./config'); // Require the config file
const app = express();
const router = express.Router();
const { register, login } = require('./controllers/usercontroller');
const authorizeRole = require('./middleware/authmiddleware');
const {
    createSepatu,
    getAllSepatu,
    getSepatuById,
    updateSepatuById,
    deleteSepatuById
  } = require('./controllers/sepatucontroller');
  const {
    createPenjualan,
    getAllPenjualan,
    getPenjualanByDate,
    deletePenjualanById,
    getTotalIncomeOutcome
  } = require('./controllers/penjualancontroller');

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Updated origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
dotenv.config();

// User Routes
router.post('/register', register);
router.post('/login', login);
// Sepatu Routes
router.post('/sepatu', createSepatu);
router.get('/sepatu', getAllSepatu);
router.get('/sepatu/:id', getSepatuById);
router.put('/sepatu/:id', updateSepatuById);
router.delete('/sepatu/:id', deleteSepatuById);
// Penjualan Routes
router.post('/penjualan', createPenjualan);
router.get('/penjualan', getAllPenjualan);
router.get('/penjualan/date/:date', getPenjualanByDate);
router.delete('/penjualan/:id', deletePenjualanById);
router.get('/penjualan/summary', authorizeRole('manager'),getTotalIncomeOutcome);

// Example route that only allows 'manager' role
router.get('/manager', authorizeRole('manager'), (req, res) => {
    res.send('Hello Manager!');
  });

router.get('/warehouse', authorizeRole('warehouse'), (req, res) => {
    res.send('Hello Manager!');
  });

router.get('/cashier', authorizeRole('cashier'), (req, res) => {
    res.send('Hello Manager!');
  });
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example route to demonstrate database connection
router.get('/test', async (req, res) => {
  try {
    const snapshot = await db.collection('testCollection').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.use('/api', router);