const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/', getCustomerOrders);
router.get('/:id', getOrderById);

module.exports = router;
