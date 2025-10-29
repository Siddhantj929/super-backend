import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import etag from '@fastify/etag';
import accepts from '@fastify/accepts';
import dependencyInjection from './plugins/dependency.injection.js';
import errorsSerializer from './plugins/errors.serializer.js';
import apiDocs from './plugins/api.docs.js';
import routesProcessor from './plugins/routes.processor.js';
import tokenProcessor from './plugins/token.processor.js';
import accessGuard from './plugins/access.guard.js';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);
fastify.register(rateLimit);
fastify.register(compress);
fastify.register(etag);
fastify.register(accepts);
fastify.register(dependencyInjection);
fastify.register(errorsSerializer);
fastify.register(apiDocs);
fastify.register(tokenProcessor);
fastify.register(accessGuard);
fastify.register(routesProcessor);

export default fastify;
