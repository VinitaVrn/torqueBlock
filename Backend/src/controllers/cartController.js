const Cart = require('../models/Cart');
const Product = require('../models/Product');

const calculateCartDetails = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      hasOutOfStockItems: false
    };
  }

  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const populatedItems = [];
  let subtotal = 0;
  let totalItems = 0;
  let hasOutOfStockItems = false;

  for (const item of cart.items) {
    const product = productMap.get(item.productId.toString());

    if (product && product.active) {
      const isAvailable = product.stock >= item.quantity;
      if (!isAvailable) {
        hasOutOfStockItems = true;
      }

      const itemSubtotal = product.b2bPrice * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;

      populatedItems.push({
        product: {
          _id: product._id,
          sku: product.sku,
          brand: product.brand,
          model: product.model,
          size: product.size,
          category: product.category,
          images: product.images,
          b2bPrice: product.b2bPrice,
          stock: product.stock
        },
        quantity: item.quantity,
        unitPrice: product.b2bPrice,
        itemSubtotal,
        isAvailable,
        availableStock: product.stock
      });
    }
  }

  return {
    items: populatedItems,
    totalItems,
    subtotal,
    hasOutOfStockItems
  };
};

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const cartDetails = await calculateCartDetails(cart);

    res.status(200).json({
      status: 'success',
      message: 'Cart retrieved successfully.',
      data: cartDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required.',
        data: null
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be a positive integer.',
        data: null
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or is currently inactive.',
        data: null
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    let targetQuantity = qty;
    if (existingIndex > -1) {
      targetQuantity = cart.items[existingIndex].quantity + qty;
    }

    if (targetQuantity > product.stock) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stock} units available in stock for ${product.brand} ${product.model}.`,
        data: null
      });
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = targetQuantity;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();

    const cartDetails = await calculateCartDetails(cart);

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart successfully.',
      data: cartDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1.',
        data: null
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
        data: null
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot set quantity to ${qty}. Only ${product.stock} units are in stock.`,
        data: null
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found.',
        data: null
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart.',
        data: null
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const cartDetails = await calculateCartDetails(cart);

    res.status(200).json({
      status: 'success',
      message: 'Cart quantity updated successfully.',
      data: cartDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found.',
        data: null
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await cart.save();

    const cartDetails = await calculateCartDetails(cart);

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
      data: cartDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared.',
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        hasOutOfStockItems: false
      }
    });
  } catch (error) {
    next(error);
  }
};
