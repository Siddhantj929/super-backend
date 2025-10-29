import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getMyPayments,
  updateMyPayment,
  getPaymentsByOrder,
  getPaymentsByType,
} from './payments.dtos.js';

async function paymentsRoutes(fastify, opts) {
  // GET /payments - Get all payments
  fastify.get('/payments', {
    schema: { ...getAllPayments },
    handler: controller('paymentsController', 'getAllPayments'),
  });

  // GET /payments/me - Get current user's payments
  fastify.get('/payments/me', {
    schema: { ...getMyPayments },
    handler: controller('paymentsController', 'getMyPayments'),
  });

  // PATCH /payments/me/:id - Update current user's payment
  fastify.patch('/payments/me/:id', {
    schema: { ...updateMyPayment },
    handler: controller('paymentsController', 'updateMyPayment'),
  });

  // GET /payments/order/:orderId - Get payments by order ID
  fastify.get('/payments/order/:orderId', {
    schema: { ...getPaymentsByOrder },
    handler: controller('paymentsController', 'getPaymentsByOrder'),
  });

  // GET /payments/type/:type - Get payments by type
  fastify.get('/payments/type/:type', {
    schema: { ...getPaymentsByType },
    handler: controller('paymentsController', 'getPaymentsByType'),
  });

  // GET /payments/:id - Get payment by ID
  fastify.get('/payments/:id', {
    schema: { ...getPaymentById },
    handler: controller('paymentsController', 'getPaymentById'),
  });

  // POST /payments - Create new payment
  fastify.post('/payments', {
    schema: { ...createPayment },
    handler: controller('paymentsController', 'createPayment'),
  });

  // PATCH /payments/:id - Update payment by ID
  fastify.patch('/payments/:id', {
    schema: { ...updatePayment },
    handler: controller('paymentsController', 'updatePayment'),
  });
}

export default fp(paymentsRoutes, {
  name: 'payments-routes',
});
