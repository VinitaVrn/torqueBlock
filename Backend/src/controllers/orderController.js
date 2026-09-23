const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TB-ORD-${dateStr}-${randomSuffix}`;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid shipping address (street, city, state, postalCode).',
        data: null
      });
    }

    const finalBillingAddress = billingAddress && billingAddress.street ? billingAddress : shippingAddress;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Your cart is empty. Please add products before placing an order.',
        data: null
      });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const snapshottedItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());

      if (!product || !product.active) {
        return res.status(400).json({
          status: 'error',
          message: 'Product is no longer active or available.',
          data: null
        });
      }

      if (product.stock < item.quantity) {
        return res.status(409).json({
          status: 'error',
          message: `Insufficient stock for ${product.brand} ${product.model}. Requested: ${item.quantity}, Available: ${product.stock}.`,
          data: null
        });
      }

      const itemSubtotal = product.b2bPrice * item.quantity;
      subtotal += itemSubtotal;

      snapshottedItems.push({
        productId: product._id,
        productName: `${product.brand} ${product.model}`,
        brand: product.brand,
        sku: product.sku,
        size: product.size,
        unitPrice: product.b2bPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const tax = 0;
    const shippingCharges = 0;
    const total = subtotal + tax + shippingCharges;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: snapshottedItems,
      shippingAddress: {
        name: shippingAddress.name || req.user.name,
        companyName: shippingAddress.companyName || req.user.companyName,
        phone: shippingAddress.phone || req.user.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      },
      billingAddress: {
        name: finalBillingAddress.name || req.user.name,
        companyName: finalBillingAddress.companyName || req.user.companyName,
        phone: finalBillingAddress.phone || req.user.phone,
        street: finalBillingAddress.street,
        city: finalBillingAddress.city,
        state: finalBillingAddress.state,
        postalCode: finalBillingAddress.postalCode,
        country: finalBillingAddress.country || 'India'
      },
      subtotal,
      tax,
      shippingCharges,
      total,
      paymentStatus: 'Pending',
      orderStatus: 'Pending Payment'
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully. Proceed to payment.',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Orders retrieved successfully.',
      data: {
        count: orders.length,
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
        data: null
      });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized. You do not have permission to view this order.',
        data: null
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order details retrieved.',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};
