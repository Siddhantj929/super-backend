import { CACHE_KEYS, CACHE_PATTERNS } from './users.constants.js';
import { notFound } from '../../../utils/http-errors.js';

export default class UsersController {
  constructor({ usersService, cacheService }) {
    this.usersService = usersService;
    this.cacheService = cacheService;
  }

  // GET /users - Get all users
  async getAllUsers(request, reply) {
    const {
      page = 1,
      limit = 10,
      status,
      role,
      searchTerm,
      dateFrom,
      dateTo,
      latitude,
      longitude,
      radius = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(
      page,
      limit,
      status,
      role,
      searchTerm,
      dateFrom,
      dateTo,
      latitude,
      longitude,
      radius,
      sortBy,
      sortOrder
    );

    let users = await this.cacheService.get(cacheKey);

    if (!users) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        role,
        searchTerm,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        location: {
          coordinates: latitude && longitude ? [parseFloat(longitude), parseFloat(latitude)] : null,
          radius: parseFloat(radius),
        },
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      users = await this.usersService.getAllUsers(filters);
      await this.cacheService.set(cacheKey, users, 300);
    }

    return reply.send(users);
  }

  async getUserById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserById(id);
      if (!user) throw notFound('User not found');
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  async createUser(request, reply) {
    const userData = request.body;
    const user = await this.usersService.createUser(userData);

    reply.status(201).send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user creation:', error);
      }
    });
  }

  async updateUser(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const user = await this.usersService.updateUser(id, updateData);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user update:', error);
      }
    });
  }

  async deleteUser(request, reply) {
    const { id } = request.params;
    const deleted = await this.usersService.deleteUser(id);
    if (!deleted) throw notFound('User not found');

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user deletion:', error);
      }
    });
  }

  async disableUser(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.disableUser(id);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user disable:', error);
      }
    });
  }

  async getMe(request, reply) {
    const userId = request.user._id;
    const cacheKey = CACHE_KEYS.ME(userId);

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserById(userId);
      if (!user) throw notFound('User not found');
      await this.cacheService.set(cacheKey, user, 300);
    }

    return reply.send(user);
  }

  async updateMe(request, reply) {
    const userId = request.user._id;
    const updateData = request.body;
    const user = await this.usersService.updateUser(userId, updateData);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(userId));
        await this.cacheService.delete(CACHE_KEYS.ME(userId));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user self-update:', error);
      }
    });
  }

  async disableMe(request, reply) {
    const userId = request.user._id;
    const user = await this.usersService.disableUser(userId);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(userId));
        await this.cacheService.delete(CACHE_KEYS.ME(userId));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for user self-disable:', error);
      }
    });
  }

  // GET /users/role/:roleId - Get users by role ID
  async getUsersByRole(request, reply) {
    const { roleId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = request.query;

    const cacheKey = CACHE_KEYS.ROLE(roleId, page, limit, status, searchTerm, sortBy, sortOrder);

    let users = await this.cacheService.get(cacheKey);

    if (!users) {
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

      users = await this.usersService.getUsersByRole(roleId, filters);
      await this.cacheService.set(cacheKey, users, 300);
    }

    return reply.send(users);
  }

  // GET /users/status/:status - Get users by status
  async getUsersByStatus(request, reply) {
    const { status } = request.params;
    const {
      page = 1,
      limit = 10,
      role,
      searchTerm,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = request.query;

    const cacheKey = CACHE_KEYS.STATUS(status, page, limit, role, searchTerm, sortBy, sortOrder);

    let users = await this.cacheService.get(cacheKey);

    if (!users) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      users = await this.usersService.getUsersByStatus(status, filters);
      await this.cacheService.set(cacheKey, users, 300);
    }

    return reply.send(users);
  }

  async getUserByEmail(request, reply) {
    const { email } = request.params;
    const cacheKey = CACHE_KEYS.EMAIL(email);

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserByEmail(email);
      if (!user) throw notFound('User not found');
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  async getUserByPhone(request, reply) {
    const { phone } = request.params;
    const cacheKey = CACHE_KEYS.PHONE(phone);

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserByPhone(phone);
      if (!user) throw notFound('User not found');
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  async updatePassword(request, reply) {
    const { id } = request.params;
    const { password } = request.body;
    const user = await this.usersService.updatePassword(id, password);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
      } catch (error) {
        console.error('Cache invalidation failed for password update:', error);
      }
    });
  }

  async verifyEmail(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.verifyEmail(id);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for email verification:', error);
      }
    });
  }

  async verifyPhone(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.verifyPhone(id);
    if (!user) throw notFound('User not found');

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.delete(CACHE_KEYS.ME(id));
      } catch (error) {
        console.error('Cache invalidation failed for phone verification:', error);
      }
    });
  }
}
