import { CACHE_KEYS, CACHE_PATTERNS, SORT_FIELDS, SORT_ORDER } from './orders.constants.js';
import { notFound } from '../../../utils/http-errors.js';

export default class OrdersController {
  constructor({ ordersService, cacheService }) {
    this.ordersService = ordersService;
    this.cacheService = cacheService;
  }

  // GET /orders - Get all orders
  async getAllOrders(request, reply) {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(
      page,
      limit,
      status,
      customerId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    );

    let orders = await this.cacheService.get(cacheKey);

    if (!orders) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        customerId,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      orders = await this.ordersService.getAllOrders(filters);
      await this.cacheService.set(cacheKey, orders, 300);
    }

    return reply.send(orders);
  }

  // GET /orders/:id - Get order by ID
  async getOrderById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let order = await this.cacheService.get(cacheKey);

    if (!order) {
      order = await this.ordersService.getOrderById(id);
      if (!order) throw notFound('Order not found');
      await this.cacheService.set(cacheKey, order, 600);
    }

    return reply.send(order);
  }

  // POST /orders - Create new order
  async createOrder(request, reply) {
    const orderData = request.body;
    const order = await this.ordersService.createOrder(orderData);

    reply.status(201).send(order);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (order.customerId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(order.customerId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for order creation:', error);
      }
    });
  }

  // PATCH /orders/:id - Update order by ID
  async updateOrder(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const order = await this.ordersService.updateOrder(id, updateData);
    if (!order) throw notFound('Order not found');

    reply.send(order);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (order.customerId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(order.customerId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for order update:', error);
      }
    });
  }

  // DELETE /orders/:id - Delete order by ID
  async deleteOrder(request, reply) {
    const { id } = request.params;
    const deleted = await this.ordersService.deleteOrder(id);
    if (!deleted) throw notFound('Order not found');

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (deleted.customerId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(deleted.customerId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for order deletion:', error);
      }
    });
  }

  // PATCH /orders/:id/disable - Disable order by ID (cancel)
  async disableOrder(request, reply) {
    const { id } = request.params;
    const order = await this.ordersService.disableOrder(id);
    if (!order) throw notFound('Order not found');

    reply.send(order);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (order.customerId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(order.customerId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for order disable:', error);
      }
    });
  }

  // GET /orders/me - Get current user's orders
  async getMyOrders(request, reply) {
    const customerId = request.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CUSTOMER_ORDERS(
      customerId,
      page,
      limit,
      status,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    );

    let orders = await this.cacheService.get(cacheKey);

    if (!orders) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      orders = await this.ordersService.getOrdersByCustomerId(customerId, filters);
      await this.cacheService.set(cacheKey, orders, 300);
    }

    return reply.send(orders);
  }

  // PATCH /orders/me/:id - Update current user's order
  async updateMyOrder(request, reply) {
    const customerId = request.user._id;
    const { id } = request.params;
    const updateData = request.body;

    const order = await this.ordersService.updateMyOrder(id, customerId, updateData);
    if (!order) throw notFound('Order not found or you do not have permission to update it');

    reply.send(order);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(customerId));
      } catch (error) {
        console.error('Cache invalidation failed for my order update:', error);
      }
    });
  }

  // PATCH /orders/me/:id/disable - Disable current user's order (cancel)
  async disableMyOrder(request, reply) {
    const customerId = request.user._id;
    const { id } = request.params;

    const order = await this.ordersService.disableMyOrder(id, customerId);
    if (!order) throw notFound('Order not found or you do not have permission to cancel it');

    reply.send(order);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.CUSTOMER(customerId));
      } catch (error) {
        console.error('Cache invalidation failed for my order disable:', error);
      }
    });
  }

  // GET /orders/customer/:customerId - Get orders by customer ID
  async getOrdersByCustomer(request, reply) {
    const { customerId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CUSTOMER_ORDERS(
      customerId,
      page,
      limit,
      status,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    );

    let orders = await this.cacheService.get(cacheKey);

    if (!orders) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      orders = await this.ordersService.getOrdersByCustomerId(customerId, filters);
      await this.cacheService.set(cacheKey, orders, 300);
    }

    return reply.send(orders);
  }

  // GET /orders/status/:status - Get orders by status
  async getOrdersByStatus(request, reply) {
    const { status } = request.params;
    const {
      page = 1,
      limit = 10,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.STATUS(status, page, limit, dateFrom, dateTo, sortBy, sortOrder);

    let orders = await this.cacheService.get(cacheKey);

    if (!orders) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      orders = await this.ordersService.getOrdersByStatus(status, filters);
      await this.cacheService.set(cacheKey, orders, 300);
    }

    return reply.send(orders);
  }
}
