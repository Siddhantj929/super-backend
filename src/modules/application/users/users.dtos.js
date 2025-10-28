import { USER_STATUS, SORT_ORDER, SORT_FIELDS } from './users.constants.js';

// GET /users - Get all users
export const getAllUsers = {
  summary: 'Get all users',
  tags: ['Users'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(USER_STATUS) },
      role: { type: 'string' },
      searchTerm: { type: 'string' },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      radius: { type: 'number', minimum: 0.1, maximum: 100, default: 10 },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /users/:id - Get user by ID
export const getUserById = {
  summary: 'Get user by ID',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /users - Create new user
export const createUser = {
  summary: 'Create new user',
  tags: ['Users'],
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 2, maxLength: 50 },
      lastName: { type: 'string', minLength: 2, maxLength: 50 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      password: { type: 'string', minLength: 6 },
      dateOfBirth: { type: 'string', format: 'date' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          postalCode: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
              },
            },
          },
        },
      },
      profilePicture: { type: 'string' },
      status: { type: 'string', enum: Object.values(USER_STATUS), default: USER_STATUS.PENDING },
      role: { type: 'string' },
    },
    required: ['firstName', 'phone', 'role'],
  },
};

// PATCH /users/:id - Update user by ID
export const updateUser = {
  summary: 'Update user by ID',
  tags: ['Users'],
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
      firstName: { type: 'string', minLength: 2, maxLength: 50 },
      lastName: { type: 'string', minLength: 2, maxLength: 50 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      dateOfBirth: { type: 'string', format: 'date' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          postalCode: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
              },
            },
          },
        },
      },
      profilePicture: { type: 'string' },
      status: { type: 'string', enum: Object.values(USER_STATUS) },
      role: { type: 'string' },
    },
  },
};

// DELETE /users/:id - Delete user by ID
export const deleteUser = {
  summary: 'Delete user by ID',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /users/:id/disable - Disable user by ID
export const disableUser = {
  summary: 'Disable user by ID',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /users/me - Get current logged-in user
export const getMe = {
  summary: 'Get current logged-in user',
  tags: ['Users'],
};

// PATCH /users/me - Update current logged-in user
export const updateMe = {
  summary: 'Update current logged-in user',
  tags: ['Users'],
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 2, maxLength: 50 },
      lastName: { type: 'string', minLength: 2, maxLength: 50 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      dateOfBirth: { type: 'string', format: 'date' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          postalCode: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
              },
            },
          },
        },
      },
      profilePicture: { type: 'string' },
    },
  },
};

// PATCH /users/me/disable - Disable current logged-in user
export const disableMe = {
  summary: 'Disable current logged-in user',
  tags: ['Users'],
};

// GET /users/role/:roleId - Get users by role ID
export const getUsersByRole = {
  summary: 'Get users by role ID',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      roleId: { type: 'string' },
    },
    required: ['roleId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(USER_STATUS) },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /users/status/:status - Get users by status
export const getUsersByStatus = {
  summary: 'Get users by status',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(USER_STATUS) },
    },
    required: ['status'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      role: { type: 'string' },
      searchTerm: { type: 'string' },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /users/email/:email - Get user by email
export const getUserByEmail = {
  summary: 'Get user by email',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
  },
};

// GET /users/phone/:phone - Get user by phone
export const getUserByPhone = {
  summary: 'Get user by phone',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      phone: { type: 'string' },
    },
    required: ['phone'],
  },
};

// PATCH /users/:id/password - Update user password
export const updatePassword = {
  summary: 'Update user password',
  tags: ['Users'],
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
      password: { type: 'string', minLength: 6 },
    },
    required: ['password'],
  },
};

// PATCH /users/:id/verify-email - Verify user email
export const verifyEmail = {
  summary: 'Verify user email',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /users/:id/verify-phone - Verify user phone
export const verifyPhone = {
  summary: 'Verify user phone',
  tags: ['Users'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};
