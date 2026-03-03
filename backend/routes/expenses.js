const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { addExpense, getGroupExpenses, getExpense, deleteExpense, getDashboard, getGroupBalanceSummary } = require('../controllers/expenseController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.post('/', upload.single('receipt'), addExpense);
router.get('/group/:group_id', getGroupExpenses);
router.get('/group/:group_id/balances', getGroupBalanceSummary);
router.get('/:id', getExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
