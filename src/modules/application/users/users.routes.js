import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  disableUser,
  getMe,
  updateMe,
  disableMe,
  getUsersByRole,
  getUsersByStatus,
  getUserByEmail,
  getUserByPhone,
  updatePassword,
  verifyEmail,
  verifyPhone,
} from './users.dtos.js';

async function usersRoutes(fastify, opts) {
  // GET /users - Get all users
  fastify.get('/users', { ...getAllUsers, handler: controller('usersController', 'getAllUsers') });

  // GET /users/:id - Get user by ID
  fastify.get('/users/:id', {
    ...getUserById,
    handler: controller('usersController', 'getUserById'),
  });

  // POST /users - Create new user
  fastify.post('/users', { ...createUser, handler: controller('usersController', 'createUser') });

  // PATCH /users/:id - Update user by ID
  fastify.patch('/users/:id', {
    ...updateUser,
    handler: controller('usersController', 'updateUser'),
  });

  // DELETE /users/:id - Delete user by ID
  fastify.delete('/users/:id', {
    ...deleteUser,
    handler: controller('usersController', 'deleteUser'),
  });

  // PATCH /users/:id/disable - Disable user by ID
  fastify.patch('/users/:id/disable', {
    ...disableUser,
    handler: controller('usersController', 'disableUser'),
  });

  // GET /users/me - Get current logged-in user
  fastify.get('/users/me', { ...getMe, handler: controller('usersController', 'getMe') });

  // PATCH /users/me - Update current logged-in user
  fastify.patch('/users/me', { ...updateMe, handler: controller('usersController', 'updateMe') });

  // PATCH /users/me/disable - Disable current logged-in user
  fastify.patch('/users/me/disable', {
    ...disableMe,
    handler: controller('usersController', 'disableMe'),
  });

  // GET /users/role/:roleId - Get users by role ID
  fastify.get('/users/role/:roleId', {
    ...getUsersByRole,
    handler: controller('usersController', 'getUsersByRole'),
  });

  // GET /users/status/:status - Get users by status
  fastify.get('/users/status/:status', {
    ...getUsersByStatus,
    handler: controller('usersController', 'getUsersByStatus'),
  });

  // GET /users/email/:email - Get user by email
  fastify.get('/users/email/:email', {
    ...getUserByEmail,
    handler: controller('usersController', 'getUserByEmail'),
  });

  // GET /users/phone/:phone - Get user by phone
  fastify.get('/users/phone/:phone', {
    ...getUserByPhone,
    handler: controller('usersController', 'getUserByPhone'),
  });

  // PATCH /users/:id/password - Update user password
  fastify.patch('/users/:id/password', {
    ...updatePassword,
    handler: controller('usersController', 'updatePassword'),
  });

  // PATCH /users/:id/verify-email - Verify user email
  fastify.patch('/users/:id/verify-email', {
    ...verifyEmail,
    handler: controller('usersController', 'verifyEmail'),
  });

  // PATCH /users/:id/verify-phone - Verify user phone
  fastify.patch('/users/:id/verify-phone', {
    ...verifyPhone,
    handler: controller('usersController', 'verifyPhone'),
  });
}

export default fp(usersRoutes, {
  name: 'users-routes',
});
