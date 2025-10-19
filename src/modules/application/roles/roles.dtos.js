import { ROLE_STATUS, SORT_ORDER, SORT_FIELDS } from './roles.constants.js';

// GET /roles - Get all roles
export const getAllRoles = {
  summary: 'Get all roles',
  tags: ['Roles'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ROLE_STATUS) },
      businessId: { type: 'string' },
      searchTerm: { type: 'string' },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /roles/:id - Get role by ID
export const getRoleById = {
  summary: 'Get role by ID',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /roles - Create new role
export const createRole = {
  summary: 'Create new role',
  tags: ['Roles'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      status: { type: 'string', enum: Object.values(ROLE_STATUS), default: ROLE_STATUS.ACTIVE },
      createdBy: { type: 'string' },
      permissions: {
        type: 'array',
        items: { type: 'string' },
        default: [],
      },
      businessId: { type: 'string' },
    },
    required: ['name', 'createdBy'],
  },
};

// PATCH /roles/:id - Update role by ID
export const updateRole = {
  summary: 'Update role by ID',
  tags: ['Roles'],
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
      name: { type: 'string', minLength: 2, maxLength: 100 },
      status: { type: 'string', enum: Object.values(ROLE_STATUS) },
      permissions: {
        type: 'array',
        items: { type: 'string' },
      },
      businessId: { type: 'string' },
    },
  },
};

// DELETE /roles/:id - Delete role by ID
export const deleteRole = {
  summary: 'Delete role by ID',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /roles/:id/disable - Disable role by ID
export const disableRole = {
  summary: 'Disable role by ID',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /roles/business/:businessId - Get roles by business ID
export const getRolesByBusinessId = {
  summary: 'Get roles by business ID',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      businessId: { type: 'string' },
    },
    required: ['businessId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ROLE_STATUS) },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /roles/created-by/:userId - Get roles created by user
export const getRolesByCreatedBy = {
  summary: 'Get roles created by user',
  tags: ['Roles'],
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
      status: { type: 'string', enum: Object.values(ROLE_STATUS) },
      businessId: { type: 'string' },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /roles/name/:name - Get role by name
export const getRoleByName = {
  summary: 'Get role by name',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    required: ['name'],
  },
};

// PATCH /roles/:id/permissions - Update role permissions
export const updateRolePermissions = {
  summary: 'Update role permissions',
  tags: ['Roles'],
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
      permissions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['permissions'],
  },
};

// GET /roles/permission/:permission - Get roles with specific permission
export const getRolesByPermission = {
  summary: 'Get roles with specific permission',
  tags: ['Roles'],
  params: {
    type: 'object',
    properties: {
      permission: { type: 'string' },
    },
    required: ['permission'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(ROLE_STATUS) },
      businessId: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};
