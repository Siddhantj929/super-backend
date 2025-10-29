import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifyScalar from '@scalar/fastify-api-reference';

async function apiDocs(fastify, opts) {
  // Register Swagger plugin for OpenAPI spec generation
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Charisma API',
        description: 'High quality Fastify backend API documentation',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token',
          },
        },
      },
    },
  });

  // Register Scalar for beautiful API documentation UI
  await fastify.register(fastifyScalar, {
    routePrefix: '/docs',
    configuration: {
      theme: 'purple',
      layout: 'modern',
      darkMode: true,
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
      hideDownloadButton: false,
      searchHotKey: 'k',
    },
  });
}

export default fp(apiDocs, {
  name: 'api-docs',
});
