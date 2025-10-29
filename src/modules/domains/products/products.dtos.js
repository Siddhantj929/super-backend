import { PRODUCT_STATUS, SORT_ORDER, SORT_FIELDS } from './products.constants.js';

// GET /products - Get all products
export const getAllProducts = {
  summary: 'Get all products',
  tags: ['Products'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
      categoryName: { type: 'string' },
      searchTerm: { type: 'string' },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      createdBy: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /products/:id - Get product by ID
export const getProductById = {
  summary: 'Get product by ID',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /products - Create new product
export const createProduct = {
  summary: 'Create new product',
  tags: ['Products'],
  body: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      categoryName: { type: 'string', minLength: 1, maxLength: 200 },
      nameLength: { type: 'number', minimum: 0 },
      descriptionLength: { type: 'number', minimum: 0 },
      photosQty: { type: 'number', minimum: 0, default: 0 },
      weightG: { type: 'number', minimum: 0 },
      lengthCm: { type: 'number', minimum: 0 },
      heightCm: { type: 'number', minimum: 0 },
      widthCm: { type: 'number', minimum: 0 },
      status: {
        type: 'string',
        enum: Object.values(PRODUCT_STATUS),
        default: PRODUCT_STATUS.ACTIVE,
      },
      createdBy: { type: 'string' },
    },
    required: ['_id', 'categoryName'],
  },
};

// PATCH /products/:id - Update product by ID
export const updateProduct = {
  summary: 'Update product by ID',
  tags: ['Products'],
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
      categoryName: { type: 'string', minLength: 1, maxLength: 200 },
      nameLength: { type: 'number', minimum: 0 },
      descriptionLength: { type: 'number', minimum: 0 },
      photosQty: { type: 'number', minimum: 0 },
      weightG: { type: 'number', minimum: 0 },
      lengthCm: { type: 'number', minimum: 0 },
      heightCm: { type: 'number', minimum: 0 },
      widthCm: { type: 'number', minimum: 0 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
    },
  },
};

// DELETE /products/:id - Delete product by ID
export const deleteProduct = {
  summary: 'Delete product by ID',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /products/:id/disable - Disable product by ID
export const disableProduct = {
  summary: 'Disable product by ID',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /products/me - Get current user's products
export const getMyProducts = {
  summary: "Get current user's products",
  tags: ['Products'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
      categoryName: { type: 'string' },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// PATCH /products/me/:id - Update current user's product
export const updateMyProduct = {
  summary: "Update current user's product",
  tags: ['Products'],
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
      categoryName: { type: 'string', minLength: 1, maxLength: 200 },
      nameLength: { type: 'number', minimum: 0 },
      descriptionLength: { type: 'number', minimum: 0 },
      photosQty: { type: 'number', minimum: 0 },
      weightG: { type: 'number', minimum: 0 },
      lengthCm: { type: 'number', minimum: 0 },
      heightCm: { type: 'number', minimum: 0 },
      widthCm: { type: 'number', minimum: 0 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
    },
  },
};

// PATCH /products/me/:id/disable - Disable current user's product
export const disableMyProduct = {
  summary: "Disable current user's product",
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /products/category/:categoryName - Get products by category
export const getProductsByCategory = {
  summary: 'Get products by category',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      categoryName: { type: 'string' },
    },
    required: ['categoryName'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /products/created-by/:userId - Get products created by user
export const getProductsByCreatedBy = {
  summary: 'Get products created by user',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
    },
    required: ['userId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
      categoryName: { type: 'string' },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /products/status/:status - Get products by status
export const getProductsByStatus = {
  summary: 'Get products by status',
  tags: ['Products'],
  params: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(PRODUCT_STATUS) },
    },
    required: ['status'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      categoryName: { type: 'string' },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};
