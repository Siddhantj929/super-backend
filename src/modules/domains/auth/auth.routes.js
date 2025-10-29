import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import { login, refresh, logout } from './auth.dtos.js';

async function authRoutes(fastify, opts) {
  fastify.post('/auth/login/email-password', {
    schema: {
      ...login,
    },
    handler: controller('authController', 'login'),
  });

  fastify.post('/auth/refresh', {
    schema: {
      ...refresh,
    },
    handler: controller('authController', 'refresh'),
  });

  fastify.post('/auth/logout', {
    schema: {
      ...logout,
    },
    handler: controller('authController', 'logout'),
  });
}

export default fp(authRoutes, {
  name: 'auth-routes',
});
