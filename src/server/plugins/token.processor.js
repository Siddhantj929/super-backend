import fp from 'fastify-plugin';
import { CACHE_KEYS } from '../../modules/application/users/users.constants.js';

async function tokenProcessor(fastify, opts) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      const { tokensService, usersService, cacheService } = fastify.diContainer.cradle;
      const authHeader = request.headers.authorization;

      request.user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = tokensService.verifyAccessToken(token);

        if (payload && payload._id) {
          // Normalize ID to string for cache key consistency
          const userId = typeof payload._id === 'string' ? payload._id : payload._id.toString();
          const cacheKey = CACHE_KEYS.SINGLE(userId);
          let user = await cacheService.get(cacheKey);

          if (!user) {
            user = await usersService.getUserById(userId);
            if (user) await cacheService.set(cacheKey, user, 600);
          }

          console.log('user', user);

          request.user = user;
        }
      }
    } catch (error) {
      request.user = null;
      fastify.log.error(error.message || error.stack);
    }
  });
}

export default fp(tokenProcessor, {
  name: 'token-processor',
});
