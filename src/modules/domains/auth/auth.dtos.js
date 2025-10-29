export const login = {
  summary: 'Login with email and password',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
    },
    required: ['email', 'password'],
  },
};

export const refresh = {
  summary: 'Refresh access token',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string', minLength: 1 },
    },
    required: ['refreshToken'],
  },
};

export const logout = {
  summary: 'Logout user',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      refreshToken: { type: 'string', minLength: 1 },
    },
    required: ['refreshToken'],
  },
};
