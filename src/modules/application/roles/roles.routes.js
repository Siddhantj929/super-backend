import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  disableRole,
  getRolesByCreatedBy,
  getRoleByName,
  updateRolePermissions,
  getRolesByPermission,
} from './roles.dtos.js';

async function rolesRoutes(fastify, opts) {
  // GET /roles - Get all roles
  fastify.get('/roles', {
    schema: { ...getAllRoles },
    handler: controller('rolesController', 'getAllRoles'),
  });

  // GET /roles/:id - Get role by ID
  fastify.get('/roles/:id', {
    schema: {
      ...getRoleById,
    },
    handler: controller('rolesController', 'getRoleById'),
  });

  // POST /roles - Create new role
  fastify.post('/roles', {
    schema: { ...createRole },
    handler: controller('rolesController', 'createRole'),
  });

  // PATCH /roles/:id - Update role by ID
  fastify.patch('/roles/:id', {
    schema: {
      ...updateRole,
    },
    handler: controller('rolesController', 'updateRole'),
  });

  // DELETE /roles/:id - Delete role by ID
  fastify.delete('/roles/:id', {
    schema: {
      ...deleteRole,
    },
    handler: controller('rolesController', 'deleteRole'),
  });

  // PATCH /roles/:id/disable - Disable role by ID
  fastify.patch('/roles/:id/disable', {
    schema: {
      ...disableRole,
    },
    handler: controller('rolesController', 'disableRole'),
  });

  // GET /roles/created-by/:userId - Get roles created by user
  fastify.get('/roles/created-by/:userId', {
    schema: {
      ...getRolesByCreatedBy,
    },
    handler: controller('rolesController', 'getRolesByCreatedBy'),
  });

  // GET /roles/name/:name - Get role by name
  fastify.get('/roles/name/:name', {
    schema: {
      ...getRoleByName,
    },
    handler: controller('rolesController', 'getRoleByName'),
  });

  // PATCH /roles/:id/permissions - Update role permissions
  fastify.patch('/roles/:id/permissions', {
    schema: {
      ...updateRolePermissions,
    },
    handler: controller('rolesController', 'updateRolePermissions'),
  });

  // GET /roles/permission/:permission - Get roles with specific permission
  fastify.get('/roles/permission/:permission', {
    schema: {
      ...getRolesByPermission,
    },
    handler: controller('rolesController', 'getRolesByPermission'),
  });
}

export default fp(rolesRoutes, {
  name: 'roles-routes',
});
