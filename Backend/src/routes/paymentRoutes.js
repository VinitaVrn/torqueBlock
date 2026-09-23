const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/fail', recordPaymentFailure);

module.exports = router;
