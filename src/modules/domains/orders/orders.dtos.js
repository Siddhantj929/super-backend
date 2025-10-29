import { ORDER_STATUS, SORT_ORDER, SORT_FIELDS } from './orders.constants.js';

// GET /orders - Get all orders
export const getAllOrders = {
  summary: 'Get all orders',
  tags: ['Orders'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      customerId: { type: 'string' },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /orders/:id - Get order by ID
export const getOrderById = {
  summary: 'Get order by ID',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /orders - Create new order
export const createOrder = {
  summary: 'Create new order',
  tags: ['Orders'],
  body: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      customerId: { type: 'string' },
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      purchaseTimestamp: { type: 'string', format: 'date-time' },
      approvedAt: { type: 'string', format: 'date-time' },
      deliveredCarrierDate: { type: 'string', format: 'date-time' },
      deliveredCustomerDate: { type: 'string', format: 'date-time' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            shippingLimitDate: { type: 'string', format: 'date-time' },
            price: { type: 'number', minimum: 0 },
            freightValue: { type: 'number', minimum: 0 },
          },
          required: ['productId', 'shippingLimitDate', 'price', 'freightValue'],
        },
        minItems: 1,
      },
    },
    required: ['_id', 'customerId', 'status', 'purchaseTimestamp', 'items'],
  },
};

// PATCH /orders/:id - Update order by ID
export const updateOrder = {
  summary: 'Update order by ID',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      approvedAt: { type: 'string', format: 'date-time' },
      deliveredCarrierDate: { type: 'string', format: 'date-time' },
      deliveredCustomerDate: { type: 'string', format: 'date-time' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            shippingLimitDate: { type: 'string', format: 'date-time' },
            price: { type: 'number', minimum: 0 },
            freightValue: { type: 'number', minimum: 0 },
          },
          required: ['productId', 'shippingLimitDate', 'price', 'freightValue'],
        },
        minItems: 1,
      },
    },
  },
};

// DELETE /orders/:id - Delete order by ID
export const deleteOrder = {
  summary: 'Delete order by ID',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /orders/:id/disable - Disable order by ID (cancel)
export const disableOrder = {
  summary: 'Disable order by ID (cancel)',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /orders/me - Get current user's orders
export const getMyOrders = {
  summary: "Get current user's orders",
  tags: ['Orders'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// PATCH /orders/me/:id - Update current user's order
export const updateMyOrder = {
  summary: "Update current user's order",
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      approvedAt: { type: 'string', format: 'date-time' },
      deliveredCarrierDate: { type: 'string', format: 'date-time' },
      deliveredCustomerDate: { type: 'string', format: 'date-time' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            shippingLimitDate: { type: 'string', format: 'date-time' },
            price: { type: 'number', minimum: 0 },
            freightValue: { type: 'number', minimum: 0 },
          },
          required: ['productId', 'shippingLimitDate', 'price', 'freightValue'],
        },
        minItems: 1,
      },
    },
  },
};

// PATCH /orders/me/:id/disable - Disable current user's order (cancel)
export const disableMyOrder = {
  summary: "Disable current user's order (cancel)",
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /orders/customer/:customerId - Get orders by customer ID
export const getOrdersByCustomer = {
  summary: 'Get orders by customer ID',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      customerId: { type: 'string' },
    },
    required: ['customerId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /orders/status/:status - Get orders by status
export const getOrdersByStatus = {
  summary: 'Get orders by status',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(ORDER_STATUS) },
    },
    required: ['status'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};
