import Order from './orders.model.js';
import { ORDER_STATUS, SORT_ORDER, SORT_FIELDS } from './orders.constants.js';

export default class OrdersService {
  constructor() {
    // No dependencies needed for now
  }

  // Get all orders with filtering and pagination
  async getAllOrders(filters) {
    const { page = 1, limit = 10, status, customerId, dateRange, sort } = filters;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Customer filter
    if (customerId) {
      query.customerId = customerId;
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      query.purchaseTimestamp = {};
      if (dateRange.from) {
        query.purchaseTimestamp.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        query.purchaseTimestamp.$lte = new Date(dateRange.to);
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

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get order by ID
  async getOrderById(id) {
    return await Order.findById(id).populate('customerId', 'firstName lastName email').lean();
  }

  // Create new order
  async createOrder(orderData) {
    const order = new Order(orderData);
    const savedOrder = await order.save();
    return await Order.findById(savedOrder._id)
      .populate('customerId', 'firstName lastName email')
      .lean();
  }

  // Update order by ID
  async updateOrder(id, updateData) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email')
      .lean();
  }

  // Delete order by ID
  async deleteOrder(id) {
    return await Order.findByIdAndDelete(id);
  }

  // Disable order by ID (cancel)
  async disableOrder(id) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: { status: ORDER_STATUS.CANCELED } },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email')
      .lean();
  }

  // Get orders by customer ID
  async getOrdersByCustomerId(customerId, filters = {}) {
    const { page = 1, limit = 10, status, dateRange, sort } = filters;

    const query = { customerId };

    if (status) {
      query.status = status;
    }

    if (dateRange?.from || dateRange?.to) {
      query.purchaseTimestamp = {};
      if (dateRange.from) {
        query.purchaseTimestamp.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        query.purchaseTimestamp.$lte = new Date(dateRange.to);
      }
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update order by ID (for specific customer)
  async updateMyOrder(id, customerId, updateData) {
    return await Order.findOneAndUpdate(
      { _id: id, customerId: customerId },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email')
      .lean();
  }

  // Disable order by ID (for specific customer)
  async disableMyOrder(id, customerId) {
    return await Order.findOneAndUpdate(
      { _id: id, customerId: customerId },
      { $set: { status: ORDER_STATUS.CANCELED } },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'firstName lastName email')
      .lean();
  }

  // Get orders by status
  async getOrdersByStatus(status, filters = {}) {
    const { page = 1, limit = 10, dateRange, sort } = filters;

    const query = { status };

    if (dateRange?.from || dateRange?.to) {
      query.purchaseTimestamp = {};
      if (dateRange.from) {
        query.purchaseTimestamp.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        query.purchaseTimestamp.$lte = new Date(dateRange.to);
      }
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
