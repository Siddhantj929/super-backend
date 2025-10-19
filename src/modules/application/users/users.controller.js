export default class UsersController {
  constructor({
    usersService,
    rolesService,
    emailsService,
    catalogsService,
    notificationsService,
    cacheService,
  }) {
    this.usersService = usersService;
    this.rolesService = rolesService;
    this.emailsService = emailsService;
    this.catalogsService = catalogsService;
    this.notificationsService = notificationsService;
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
        await this.emailsService.sendWelcomeEmail(user.email, user.firstName);
        await this.notificationsService.sendWelcomeNotification(user._id);
      } catch (error) {
        console.error('Background operations failed for user creation:', error);
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
        await this.notificationsService.sendAccountDisabledNotification(user._id);
      } catch (error) {
        console.error('Background operations failed for user disable:', error);
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
        await this.notificationsService.sendAccountDisabledNotification(user._id);
      } catch (error) {
        console.error('Background operations failed for user self-disable:', error);
      }
    });
  }
}
