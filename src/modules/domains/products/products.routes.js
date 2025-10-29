import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  disableProduct,
  getMyProducts,
  updateMyProduct,
  disableMyProduct,
  getProductsByCategory,
  getProductsByCreatedBy,
  getProductsByStatus,
} from './products.dtos.js';

async function productsRoutes(fastify, opts) {
  // GET /products - Get all products
  fastify.get('/products', {
    schema: { ...getAllProducts },
    handler: controller('productsController', 'getAllProducts'),
  });

  // GET /products/me - Get current user's products
  fastify.get('/products/me', {
    schema: { ...getMyProducts },
    handler: controller('productsController', 'getMyProducts'),
  });

  // PATCH /products/me/:id - Update current user's product
  fastify.patch('/products/me/:id', {
    schema: { ...updateMyProduct },
    handler: controller('productsController', 'updateMyProduct'),
  });

  // PATCH /products/me/:id/disable - Disable current user's product
  fastify.patch('/products/me/:id/disable', {
    schema: { ...disableMyProduct },
    handler: controller('productsController', 'disableMyProduct'),
  });

  // GET /products/category/:categoryName - Get products by category
  fastify.get('/products/category/:categoryName', {
    schema: { ...getProductsByCategory },
    handler: controller('productsController', 'getProductsByCategory'),
  });

  // GET /products/created-by/:userId - Get products created by user
  fastify.get('/products/created-by/:userId', {
    schema: { ...getProductsByCreatedBy },
    handler: controller('productsController', 'getProductsByCreatedBy'),
  });

  // GET /products/status/:status - Get products by status
  fastify.get('/products/status/:status', {
    schema: { ...getProductsByStatus },
    handler: controller('productsController', 'getProductsByStatus'),
  });

  // GET /products/:id - Get product by ID
  fastify.get('/products/:id', {
    schema: { ...getProductById },
    handler: controller('productsController', 'getProductById'),
  });

  // POST /products - Create new product
  fastify.post('/products', {
    schema: { ...createProduct },
    handler: controller('productsController', 'createProduct'),
  });

  // PATCH /products/:id - Update product by ID
  fastify.patch('/products/:id', {
    schema: { ...updateProduct },
    handler: controller('productsController', 'updateProduct'),
  });

  // DELETE /products/:id - Delete product by ID
  fastify.delete('/products/:id', {
    schema: { ...deleteProduct },
    handler: controller('productsController', 'deleteProduct'),
  });

  // PATCH /products/:id/disable - Disable product by ID
  fastify.patch('/products/:id/disable', {
    schema: { ...disableProduct },
    handler: controller('productsController', 'disableProduct'),
  });
}

export default fp(productsRoutes, {
  name: 'products-routes',
});
