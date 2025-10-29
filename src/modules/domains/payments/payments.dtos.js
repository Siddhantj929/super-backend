import { PAYMENT_TYPE, SORT_ORDER, SORT_FIELDS } from './payments.constants.js';

// GET /payments - Get all payments
export const getAllPayments = {
  summary: 'Get all payments',
  tags: ['Payments'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      orderId: { type: 'string' },
      minValue: { type: 'number', minimum: 0 },
      maxValue: { type: 'number', minimum: 0 },
      minInstallments: { type: 'integer', minimum: 1 },
      maxInstallments: { type: 'integer', minimum: 1 },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /payments/:id - Get payment by ID
export const getPaymentById = {
  summary: 'Get payment by ID',
  tags: ['Payments'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /payments - Create new payment
export const createPayment = {
  summary: 'Create new payment',
  tags: ['Payments'],
  body: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      installments: { type: 'integer', minimum: 1, default: 1 },
      value: { type: 'number', minimum: 0 },
    },
    required: ['orderId', 'type', 'value'],
  },
};

// PATCH /payments/:id - Update payment by ID
export const updatePayment = {
  summary: 'Update payment by ID',
  tags: ['Payments'],
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
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      installments: { type: 'integer', minimum: 1 },
      value: { type: 'number', minimum: 0 },
    },
  },
};

// GET /payments/me - Get current user's payments
export const getMyPayments = {
  summary: "Get current user's payments",
  tags: ['Payments'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// PATCH /payments/me/:id - Update current user's payment
export const updateMyPayment = {
  summary: "Update current user's payment",
  tags: ['Payments'],
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
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      installments: { type: 'integer', minimum: 1 },
      value: { type: 'number', minimum: 0 },
    },
  },
};

// GET /payments/order/:orderId - Get payments by order ID
export const getPaymentsByOrder = {
  summary: 'Get payments by order ID',
  tags: ['Payments'],
  params: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
    },
    required: ['orderId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /payments/type/:type - Get payments by type
export const getPaymentsByType = {
  summary: 'Get payments by type',
  tags: ['Payments'],
  params: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: Object.values(PAYMENT_TYPE) },
    },
    required: ['type'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      minValue: { type: 'number', minimum: 0 },
      maxValue: { type: 'number', minimum: 0 },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};
