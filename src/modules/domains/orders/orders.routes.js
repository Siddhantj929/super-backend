import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  disableOrder,
  getMyOrders,
  updateMyOrder,
  disableMyOrder,
  getOrdersByCustomer,
  getOrdersByStatus,
} from './orders.dtos.js';

async function ordersRoutes(fastify, opts) {
  // GET /orders - Get all orders
  fastify.get('/orders', {
    schema: { ...getAllOrders },
    handler: controller('ordersController', 'getAllOrders'),
  });

  // GET /orders/me - Get current user's orders
  fastify.get('/orders/me', {
    schema: { ...getMyOrders },
    handler: controller('ordersController', 'getMyOrders'),
  });

  // PATCH /orders/me/:id - Update current user's order
  fastify.patch('/orders/me/:id', {
    schema: { ...updateMyOrder },
    handler: controller('ordersController', 'updateMyOrder'),
  });

  // PATCH /orders/me/:id/disable - Disable current user's order (cancel)
  fastify.patch('/orders/me/:id/disable', {
    schema: { ...disableMyOrder },
    handler: controller('ordersController', 'disableMyOrder'),
  });

  // GET /orders/customer/:customerId - Get orders by customer ID
  fastify.get('/orders/customer/:customerId', {
    schema: { ...getOrdersByCustomer },
    handler: controller('ordersController', 'getOrdersByCustomer'),
  });

  // GET /orders/status/:status - Get orders by status
  fastify.get('/orders/status/:status', {
    schema: { ...getOrdersByStatus },
    handler: controller('ordersController', 'getOrdersByStatus'),
  });

  // GET /orders/:id - Get order by ID
  fastify.get('/orders/:id', {
    schema: { ...getOrderById },
    handler: controller('ordersController', 'getOrderById'),
  });

  // POST /orders - Create new order
  fastify.post('/orders', {
    schema: { ...createOrder },
    handler: controller('ordersController', 'createOrder'),
  });

  // PATCH /orders/:id - Update order by ID
  fastify.patch('/orders/:id', {
    schema: { ...updateOrder },
    handler: controller('ordersController', 'updateOrder'),
  });

  // DELETE /orders/:id - Delete order by ID
  fastify.delete('/orders/:id', {
    schema: { ...deleteOrder },
    handler: controller('ordersController', 'deleteOrder'),
  });

  // PATCH /orders/:id/disable - Disable order by ID (cancel)
  fastify.patch('/orders/:id/disable', {
    schema: { ...disableOrder },
    handler: controller('ordersController', 'disableOrder'),
  });
}

export default fp(ordersRoutes, {
  name: 'orders-routes',
});
