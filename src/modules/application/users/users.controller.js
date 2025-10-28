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

    const cacheKey = `users:list:${page}:${limit}:${status || 'all'}:${
      role || 'all'
    }:${searchTerm || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${
      latitude || 'all'
    }:${longitude || 'all'}:${radius}:${sortBy}:${sortOrder}`;

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

  // GET /users/:id - Get user by ID
  async getUserById(request, reply) {
    const { id } = request.params;
    const cacheKey = `users:single:${id}`;

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserById(id);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  // POST /users - Create new user
  async createUser(request, reply) {
    const userData = request.body;
    const user = await this.usersService.createUser(userData);

    reply.status(201).send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for user creation:', error);
      }
    });
  }

  // PATCH /users/:id - Update user by ID
  async updateUser(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const user = await this.usersService.updateUser(id, updateData);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for user update:', error);
      }
    });
  }

  // DELETE /users/:id - Delete user by ID
  async deleteUser(request, reply) {
    const { id } = request.params;
    const deleted = await this.usersService.deleteUser(id);
    if (!deleted) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for user deletion:', error);
      }
    });
  }

  // PATCH /users/:id/disable - Disable user by ID
  async disableUser(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.disableUser(id);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for user disable:', error);
      }
    });
  }

  // GET /users/me - Get current logged-in user
  async getMe(request, reply) {
    const userId = request.user._id;
    const cacheKey = `users:me:${userId}`;

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserById(userId);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      await this.cacheService.set(cacheKey, user, 300);
    }

    return reply.send(user);
  }

  // PATCH /users/me - Update current logged-in user
  async updateMe(request, reply) {
    const userId = request.user._id;
    const updateData = request.body;
    const user = await this.usersService.updateUser(userId, updateData);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${userId}`);
        await this.cacheService.delete(`users:me:${userId}`);
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for user self-update:', error);
      }
    });
  }

  // PATCH /users/me/disable - Disable current logged-in user
  async disableMe(request, reply) {
    const userId = request.user._id;
    const user = await this.usersService.disableUser(userId);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${userId}`);
        await this.cacheService.delete(`users:me:${userId}`);
        await this.cacheService.deletePattern('users:list:*');
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

    const cacheKey = `users:role:${roleId}:${page}:${limit}:${status || 'all'}:${
      searchTerm || 'all'
    }:${sortBy}:${sortOrder}`;

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

    const cacheKey = `users:status:${status}:${page}:${limit}:${role || 'all'}:${
      searchTerm || 'all'
    }:${sortBy}:${sortOrder}`;

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

  // GET /users/email/:email - Get user by email
  async getUserByEmail(request, reply) {
    const { email } = request.params;
    const cacheKey = `users:email:${email}`;

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserByEmail(email);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  // GET /users/phone/:phone - Get user by phone
  async getUserByPhone(request, reply) {
    const { phone } = request.params;
    const cacheKey = `users:phone:${phone}`;

    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.usersService.getUserByPhone(phone);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      await this.cacheService.set(cacheKey, user, 600);
    }

    return reply.send(user);
  }

  // PATCH /users/:id/password - Update user password
  async updatePassword(request, reply) {
    const { id } = request.params;
    const { password } = request.body;
    const user = await this.usersService.updatePassword(id, password);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
      } catch (error) {
        console.error('Cache invalidation failed for password update:', error);
      }
    });
  }

  // PATCH /users/:id/verify-email - Verify user email
  async verifyEmail(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.verifyEmail(id);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
        await this.cacheService.deletePattern('users:list:*');
      } catch (error) {
        console.error('Cache invalidation failed for email verification:', error);
      }
    });
  }

  // PATCH /users/:id/verify-phone - Verify user phone
  async verifyPhone(request, reply) {
    const { id } = request.params;
    const user = await this.usersService.verifyPhone(id);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send(user);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(`users:single:${id}`);
        await this.cacheService.delete(`users:me:${id}`);
      } catch (error) {
        console.error('Cache invalidation failed for phone verification:', error);
      }
    });
  }
}
