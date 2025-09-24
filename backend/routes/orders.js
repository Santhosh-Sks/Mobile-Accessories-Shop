const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.image
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate tax and shipping
    const tax = subtotal * 0.18; // 18% GST
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
    const totalAmount = subtotal + tax + shippingCost;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      notes,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: await Order.findById(order._id).populate('items.product', 'name image')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user orders
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image category brand')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN ROUTES

// Get all orders (Admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      startDate, 
      endDate,
      orderNumber 
    } = req.query;
    
    let query = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: 'i' };
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order statistics (Admin only)
router.get('/stats/summary', auth, adminAuth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue,
      monthlyOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      monthlyOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
