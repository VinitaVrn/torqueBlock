const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:productId', updateQuantity);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
