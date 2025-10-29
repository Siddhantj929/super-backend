import { CACHE_KEYS, CACHE_PATTERNS, SORT_FIELDS, SORT_ORDER } from './payments.constants.js';
import { notFound } from '../../../utils/http-errors.js';

export default class PaymentsController {
  constructor({ paymentsService, cacheService }) {
    this.paymentsService = paymentsService;
    this.cacheService = cacheService;
  }

  // GET /payments - Get all payments
  async getAllPayments(request, reply) {
    const {
      page = 1,
      limit = 10,
      type,
      orderId,
      minValue,
      maxValue,
      minInstallments,
      maxInstallments,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(
      page,
      limit,
      type,
      orderId,
      minValue,
      maxValue,
      minInstallments,
      maxInstallments,
      sortBy,
      sortOrder
    );

    let payments = await this.cacheService.get(cacheKey);

    if (!payments) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        orderId,
        valueRange: {
          min: minValue !== undefined ? parseFloat(minValue) : undefined,
          max: maxValue !== undefined ? parseFloat(maxValue) : undefined,
        },
        installmentsRange: {
          min: minInstallments !== undefined ? parseInt(minInstallments) : undefined,
          max: maxInstallments !== undefined ? parseInt(maxInstallments) : undefined,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      payments = await this.paymentsService.getAllPayments(filters);
      await this.cacheService.set(cacheKey, payments, 300);
    }

    return reply.send(payments);
  }

  // GET /payments/:id - Get payment by ID
  async getPaymentById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let payment = await this.cacheService.get(cacheKey);

    if (!payment) {
      payment = await this.paymentsService.getPaymentById(id);
      if (!payment) throw notFound('Payment not found');
      await this.cacheService.set(cacheKey, payment, 600);
    }

    return reply.send(payment);
  }

  // POST /payments - Create new payment
  async createPayment(request, reply) {
    const paymentData = request.body;
    const payment = await this.paymentsService.createPayment(paymentData);

    reply.status(201).send(payment);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (payment.orderId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ORDER(payment.orderId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for payment creation:', error);
      }
    });
  }

  // PATCH /payments/:id - Update payment by ID
  async updatePayment(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const payment = await this.paymentsService.updatePayment(id, updateData);
    if (!payment) throw notFound('Payment not found');

    reply.send(payment);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (payment.orderId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ORDER(payment.orderId));
        }
      } catch (error) {
        console.error('Cache invalidation failed for payment update:', error);
      }
    });
  }

  // GET /payments/me - Get current user's payments
  async getMyPayments(request, reply) {
    const userId = request.user._id;
    const {
      page = 1,
      limit = 10,
      type,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    // Since we need to find orders first, cache key includes user ID
    const cacheKey = `payments:user:${userId}:${page}:${limit}:${type || 'all'}:${sortBy}:${sortOrder}`;

    let payments = await this.cacheService.get(cacheKey);

    if (!payments) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      payments = await this.paymentsService.getPaymentsByUserId(userId, filters);
      await this.cacheService.set(cacheKey, payments, 300);
    }

    return reply.send(payments);
  }

  // PATCH /payments/me/:id - Update current user's payment
  async updateMyPayment(request, reply) {
    const userId = request.user._id;
    const { id } = request.params;
    const updateData = request.body;

    const payment = await this.paymentsService.updateMyPayment(id, userId, updateData);
    if (!payment) throw notFound('Payment not found or you do not have permission to update it');

    reply.send(payment);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (payment.orderId) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ORDER(payment.orderId));
        }
        // Also clear user-specific cache
        await this.cacheService.deletePattern(`payments:user:${userId}*`);
      } catch (error) {
        console.error('Cache invalidation failed for my payment update:', error);
      }
    });
  }

  // GET /payments/order/:orderId - Get payments by order ID
  async getPaymentsByOrder(request, reply) {
    const { orderId } = request.params;
    const {
      page = 1,
      limit = 10,
      type,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.ORDER_PAYMENTS(orderId, page, limit, type, sortBy, sortOrder);

    let payments = await this.cacheService.get(cacheKey);

    if (!payments) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      payments = await this.paymentsService.getPaymentsByOrderId(orderId, filters);
      await this.cacheService.set(cacheKey, payments, 300);
    }

    return reply.send(payments);
  }

  // GET /payments/type/:type - Get payments by type
  async getPaymentsByType(request, reply) {
    const { type } = request.params;
    const {
      page = 1,
      limit = 10,
      minValue,
      maxValue,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.TYPE(type, page, limit, minValue, maxValue, sortBy, sortOrder);

    let payments = await this.cacheService.get(cacheKey);

    if (!payments) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        valueRange: {
          min: minValue !== undefined ? parseFloat(minValue) : undefined,
          max: maxValue !== undefined ? parseFloat(maxValue) : undefined,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      payments = await this.paymentsService.getPaymentsByType(type, filters);
      await this.cacheService.set(cacheKey, payments, 300);
    }

    return reply.send(payments);
  }
}
