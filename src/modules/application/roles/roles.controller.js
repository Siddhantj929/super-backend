import { SORT_ORDER, SORT_FIELDS } from './roles.constants.js';

export default class RolesController {
  constructor({ rolesService, cacheService }) {
    this.rolesService = rolesService;
    this.cacheService = cacheService;
  }

  // GET /roles - Get all roles
  async getAllRoles(request, reply) {
    const {
      page = 1,
      limit = 10,
      status,
      businessId,
      searchTerm,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = `roles:list:${page}:${limit}:${status || 'all'}:${
      businessId || 'all'
    }:${searchTerm || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${sortBy}:${sortOrder}`;

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        businessId,
        searchTerm,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      roles = await this.rolesService.getAllRoles(filters);
      await this.cacheService.set(cacheKey, roles, 300);
    }

    return reply.send(roles);
  }

  // GET /roles/:id - Get role by ID
  async getRoleById(request, reply) {
    const { id } = request.params;
    const cacheKey = `roles:single:${id}`;

    let role = await this.cacheService.get(cacheKey);

    if (!role) {
      role = await this.rolesService.getRoleById(id);
      if (!role) {
        return reply.status(404).send({ error: 'Role not found' });
      }
      await this.cacheService.set(cacheKey, role, 600);
    }

    return reply.send(role);
  }

  // POST /roles - Create new role
  async createRole(request, reply) {
    const roleData = request.body;
    const role = await this.rolesService.createRole(roleData);

    reply.status(201).send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern('roles:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for role creation:', error);
      }
    });
  }

  // PATCH /roles/:id - Update role by ID
  async updateRole(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const role = await this.rolesService.updateRole(id, updateData);
    if (!role) {
      return reply.status(404).send({ error: 'Role not found' });
    }

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`roles:single:${id}`);
        await this.cacheService.deletePattern('roles:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for role update:', error);
      }
    });
  }

  // DELETE /roles/:id - Delete role by ID
  async deleteRole(request, reply) {
    const { id } = request.params;
    const deleted = await this.rolesService.deleteRole(id);
    if (!deleted) {
      return reply.status(404).send({ error: 'Role not found' });
    }

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`roles:single:${id}`);
        await this.cacheService.deletePattern('roles:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for role deletion:', error);
      }
    });
  }

  // PATCH /roles/:id/disable - Disable role by ID
  async disableRole(request, reply) {
    const { id } = request.params;
    const role = await this.rolesService.disableRole(id);
    if (!role) {
      return reply.status(404).send({ error: 'Role not found' });
    }

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`roles:single:${id}`);
        await this.cacheService.deletePattern('roles:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for role disable:', error);
      }
    });
  }

  // GET /roles/business/:businessId - Get roles by business ID
  async getRolesByBusinessId(request, reply) {
    const { businessId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = `roles:business:${businessId}:${page}:${limit}:${status || 'all'}:${
      searchTerm || 'all'
    }:${sortBy}:${sortOrder}`;

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      roles = await this.rolesService.getRolesByBusinessId(businessId, filters);
      await this.cacheService.set(cacheKey, roles, 300);
    }

    return reply.send(roles);
  }

  // GET /roles/created-by/:userId - Get roles created by user
  async getRolesByCreatedBy(request, reply) {
    const { userId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      businessId,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = `roles:created-by:${userId}:${page}:${limit}:${status || 'all'}:${
      businessId || 'all'
    }:${searchTerm || 'all'}:${sortBy}:${sortOrder}`;

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        businessId,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      roles = await this.rolesService.getRolesByCreatedBy(userId, filters);
      await this.cacheService.set(cacheKey, roles, 300);
    }

    return reply.send(roles);
  }

  // GET /roles/name/:name - Get role by name
  async getRoleByName(request, reply) {
    const { name } = request.params;
    const cacheKey = `roles:name:${name}`;

    let role = await this.cacheService.get(cacheKey);

    if (!role) {
      role = await this.rolesService.getRoleByName(name);
      if (!role) {
        return reply.status(404).send({ error: 'Role not found' });
      }
      await this.cacheService.set(cacheKey, role, 600);
    }

    return reply.send(role);
  }

  // PATCH /roles/:id/permissions - Update role permissions
  async updateRolePermissions(request, reply) {
    const { id } = request.params;
    const { permissions } = request.body;
    const role = await this.rolesService.updateRolePermissions(id, permissions);
    if (!role) {
      return reply.status(404).send({ error: 'Role not found' });
    }

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`roles:single:${id}`);
        await this.cacheService.deletePattern('roles:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for role permissions update:', error);
      }
    });
  }

  // GET /roles/permission/:permission - Get roles with specific permission
  async getRolesByPermission(request, reply) {
    const { permission } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      businessId,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = `roles:permission:${permission}:${page}:${limit}:${status || 'all'}:${
      businessId || 'all'
    }:${sortBy}:${sortOrder}`;

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        businessId,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      roles = await this.rolesService.getRolesByPermission(permission, filters);
      await this.cacheService.set(cacheKey, roles, 300);
    }

    return reply.send(roles);
  }
}
