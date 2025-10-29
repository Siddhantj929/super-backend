import Payment from './payments.model.js';
import Order from '../orders/orders.model.js';
import { PAYMENT_TYPE, SORT_ORDER, SORT_FIELDS } from './payments.constants.js';

export default class PaymentsService {
  constructor() {
    // No dependencies needed for now
  }

  // Get all payments with filtering and pagination
  async getAllPayments(filters) {
    const { page = 1, limit = 10, type, orderId, valueRange, installmentsRange, sort } = filters;

    const query = {};

    // Type filter
    if (type) {
      query.type = type;
    }

    // Order ID filter
    if (orderId) {
      query.orderId = orderId;
    }

    // Value range filter
    if (valueRange?.min !== undefined || valueRange?.max !== undefined) {
      query.value = {};
      if (valueRange.min !== undefined) {
        query.value.$gte = valueRange.min;
      }
      if (valueRange.max !== undefined) {
        query.value.$lte = valueRange.max;
      }
    }

    // Installments range filter
    if (installmentsRange?.min !== undefined || installmentsRange?.max !== undefined) {
      query.installments = {};
      if (installmentsRange.min !== undefined) {
        query.installments.$gte = installmentsRange.min;
      }
      if (installmentsRange.max !== undefined) {
        query.installments.$lte = installmentsRange.max;
      }
    }

    // Sort options
    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions[SORT_FIELDS.CREATED_AT] = -1; // Default sort by creation date
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).populate('orderId').sort(sortOptions).skip(skip).limit(limit).lean(),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get payment by ID
  async getPaymentById(id) {
    return await Payment.findById(id).populate('orderId').lean();
  }

  // Create new payment
  async createPayment(paymentData) {
    const payment = new Payment(paymentData);
    const savedPayment = await payment.save();
    return await Payment.findById(savedPayment._id).populate('orderId').lean();
  }

  // Update payment by ID
  async updatePayment(id, updateData) {
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('orderId')
      .lean();
  }

  // Get payments by user ID (for "my" endpoints)
  // First find all orders for the user, then find all payments for those orders
  async getPaymentsByUserId(userId, filters = {}) {
    const { page = 1, limit = 10, type, sort } = filters;

    // First, find all orders for this user
    const userOrders = await Order.find({ customerId: userId }).select('_id').lean();
    const orderIds = userOrders.map(order => order._id);

    if (orderIds.length === 0) {
      // No orders found for this user
      return {
        payments: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }

    // Now find payments for these orders
    const query = { orderId: { $in: orderIds } };

    if (type) {
      query.type = type;
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).populate('orderId').sort(sortOptions).skip(skip).limit(limit).lean(),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update payment by ID (for specific user)
  // Check if the payment's order belongs to the user
  async updateMyPayment(id, userId, updateData) {
    // First get the payment to check the order
    const payment = await Payment.findById(id);
    if (!payment) return null;

    // Check if the order belongs to the user
    const order = await Order.findOne({ _id: payment.orderId, customerId: userId });
    if (!order) return null;

    // Update the payment
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('orderId')
      .lean();
  }

  // Get payments by order ID
  async getPaymentsByOrderId(orderId, filters = {}) {
    const { page = 1, limit = 10, type, sort } = filters;

    const query = { orderId };

    if (type) {
      query.type = type;
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).populate('orderId').sort(sortOptions).skip(skip).limit(limit).lean(),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get payments by type
  async getPaymentsByType(type, filters = {}) {
    const { page = 1, limit = 10, valueRange, sort } = filters;

    const query = { type };

    if (valueRange?.min !== undefined || valueRange?.max !== undefined) {
      query.value = {};
      if (valueRange.min !== undefined) {
        query.value.$gte = valueRange.min;
      }
      if (valueRange.max !== undefined) {
        query.value.$lte = valueRange.max;
      }
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).populate('orderId').sort(sortOptions).skip(skip).limit(limit).lean(),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
