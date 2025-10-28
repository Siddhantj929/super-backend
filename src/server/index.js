import Fastify from 'fastify';
import dependencyInjection from './plugins/dependency.injection.js';
import routesProcessor from './plugins/routes.processor.js';
import tokenProcessor from './plugins/token.processor.js';

const fastify = Fastify({
  logger: true,
});

fastify.register(dependencyInjection);
fastify.register(routesProcessor);
fastify.register(tokenProcessor);

export default fastify;
