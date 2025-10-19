import fp from 'fastify-plugin';

async function tokenProcessor(fastify, opts) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      // Get tokensService from DI container
      const { tokensService } = fastify.diContainer.cradle;

      // Extract token from Authorization header
      const authHeader = request.headers.authorization;

      request.user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const payload = tokensService.verifyAccessToken(token);
        request.user = payload;
      }
    } catch (error) {
      // If verification fails or any other error, set user to null
      request.user = null;
      fastify.log.error(error.message || error.stack);
    }
  });
}

export default fp(tokenProcessor, {
  name: 'token-processor',
});
