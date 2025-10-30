import { SORT_ORDER, SORT_FIELDS, CACHE_KEYS, CACHE_PATTERNS } from './roles.constants.js';
import { notFound } from '../../../utils/http-errors.js';

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
      searchTerm,
      dateFrom,
      dateTo,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(
      page,
      limit,
      status,
      searchTerm,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    );

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
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

  async getRoleById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let role = await this.cacheService.get(cacheKey);

    if (!role) {
      role = await this.rolesService.getRoleById(id);
      if (!role) throw notFound('Role not found');
      await this.cacheService.set(cacheKey, role, 600);
    }

    return reply.send(role);
  }

  async createRole(request, reply) {
    const roleData = request.body;
    const role = await this.rolesService.createRole(roleData);

    reply.status(201).send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for role creation:', error);
      }
    });
  }

  async updateRole(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const role = await this.rolesService.updateRole(id, updateData);
    if (!role) throw notFound('Role not found');

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for role update:', error);
      }
    });
  }

  async deleteRole(request, reply) {
    const { id } = request.params;
    const deleted = await this.rolesService.deleteRole(id);
    if (!deleted) throw notFound('Role not found');

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for role deletion:', error);
      }
    });
  }

  async disableRole(request, reply) {
    const { id } = request.params;
    const role = await this.rolesService.disableRole(id);
    if (!role) throw notFound('Role not found');

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for role disable:', error);
      }
    });
  }

  // GET /roles/created-by/:userId - Get roles created by user
  async getRolesByCreatedBy(request, reply) {
    const { userId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CREATED_BY(
      userId,
      page,
      limit,
      status,
      searchTerm,
      sortBy,
      sortOrder
    );

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

      roles = await this.rolesService.getRolesByCreatedBy(userId, filters);
      await this.cacheService.set(cacheKey, roles, 300);
    }

    return reply.send(roles);
  }

  async getRoleByName(request, reply) {
    const { name } = request.params;
    const cacheKey = CACHE_KEYS.NAME(name);

    let role = await this.cacheService.get(cacheKey);

    if (!role) {
      role = await this.rolesService.getRoleByName(name);
      if (!role) throw notFound('Role not found');
      await this.cacheService.set(cacheKey, role, 600);
    }

    return reply.send(role);
  }

  async updateRolePermissions(request, reply) {
    const { id } = request.params;
    const { permissions } = request.body;
    const role = await this.rolesService.updateRolePermissions(id, permissions);
    if (!role) throw notFound('Role not found');

    reply.send(role);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
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
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.PERMISSION(permission, page, limit, status, sortBy, sortOrder);

    let roles = await this.cacheService.get(cacheKey);

    if (!roles) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
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
