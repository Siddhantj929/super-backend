import { CACHE_KEYS, CACHE_PATTERNS, SORT_FIELDS, SORT_ORDER } from './products.constants.js';
import { notFound, forbidden } from '../../../utils/http-errors.js';

export default class ProductsController {
  constructor({ productsService, cacheService }) {
    this.productsService = productsService;
    this.cacheService = cacheService;
  }

  // GET /products - Get all products
  async getAllProducts(request, reply) {
    const {
      page = 1,
      limit = 10,
      status,
      categoryName,
      searchTerm,
      dateFrom,
      dateTo,
      createdBy,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(
      page,
      limit,
      status,
      categoryName,
      searchTerm,
      dateFrom,
      dateTo,
      createdBy,
      sortBy,
      sortOrder
    );

    let products = await this.cacheService.get(cacheKey);

    if (!products) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        categoryName,
        searchTerm,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        createdBy,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      products = await this.productsService.getAllProducts(filters);
      await this.cacheService.set(cacheKey, products, 300);
    }

    return reply.send(products);
  }

  // GET /products/:id - Get product by ID
  async getProductById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let product = await this.cacheService.get(cacheKey);

    if (!product) {
      product = await this.productsService.getProductById(id);
      if (!product) throw notFound('Product not found');
      await this.cacheService.set(cacheKey, product, 600);
    }

    return reply.send(product);
  }

  // POST /products - Create new product
  async createProduct(request, reply) {
    const productData = request.body;
    const product = await this.productsService.createProduct(productData);

    reply.status(201).send(product);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
      } catch (error) {
        console.error('Cache invalidation failed for product creation:', error);
      }
    });
  }

  // PATCH /products/:id - Update product by ID
  async updateProduct(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const product = await this.productsService.updateProduct(id, updateData);
    if (!product) throw notFound('Product not found');

    reply.send(product);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (product.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ME(product.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for product update:', error);
      }
    });
  }

  // DELETE /products/:id - Delete product by ID
  async deleteProduct(request, reply) {
    const { id } = request.params;
    const deleted = await this.productsService.deleteProduct(id);
    if (!deleted) throw notFound('Product not found');

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (deleted.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ME(deleted.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for product deletion:', error);
      }
    });
  }

  // PATCH /products/:id/disable - Disable product by ID
  async disableProduct(request, reply) {
    const { id } = request.params;
    const product = await this.productsService.disableProduct(id);
    if (!product) throw notFound('Product not found');

    reply.send(product);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (product.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.ME(product.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for product disable:', error);
      }
    });
  }

  // GET /products/me - Get current user's products
  async getMyProducts(request, reply) {
    const userId = request.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      categoryName,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CREATED_BY(
      userId,
      page,
      limit,
      status,
      categoryName,
      searchTerm,
      sortBy,
      sortOrder
    );

    let products = await this.cacheService.get(cacheKey);

    if (!products) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        categoryName,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      products = await this.productsService.getProductsByUserId(userId, filters);
      await this.cacheService.set(cacheKey, products, 300);
    }

    return reply.send(products);
  }

  // PATCH /products/me/:id - Update current user's product
  async updateMyProduct(request, reply) {
    const userId = request.user._id;
    const { id } = request.params;
    const updateData = request.body;

    const product = await this.productsService.updateMyProduct(id, userId, updateData);
    if (!product) throw notFound('Product not found or you do not have permission to update it');

    reply.send(product);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.ME(userId));
      } catch (error) {
        console.error('Cache invalidation failed for my product update:', error);
      }
    });
  }

  // PATCH /products/me/:id/disable - Disable current user's product
  async disableMyProduct(request, reply) {
    const userId = request.user._id;
    const { id } = request.params;

    const product = await this.productsService.disableMyProduct(id, userId);
    if (!product) throw notFound('Product not found or you do not have permission to disable it');

    reply.send(product);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.ME(userId));
      } catch (error) {
        console.error('Cache invalidation failed for my product disable:', error);
      }
    });
  }

  // GET /products/category/:categoryName - Get products by category
  async getProductsByCategory(request, reply) {
    const { categoryName } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CATEGORY(
      categoryName,
      page,
      limit,
      status,
      searchTerm,
      sortBy,
      sortOrder
    );

    let products = await this.cacheService.get(cacheKey);

    if (!products) {
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

      products = await this.productsService.getProductsByCategory(categoryName, filters);
      await this.cacheService.set(cacheKey, products, 300);
    }

    return reply.send(products);
  }

  // GET /products/created-by/:userId - Get products created by user
  async getProductsByCreatedBy(request, reply) {
    const { userId } = request.params;
    const {
      page = 1,
      limit = 10,
      status,
      categoryName,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.CREATED_BY(
      userId,
      page,
      limit,
      status,
      categoryName,
      searchTerm,
      sortBy,
      sortOrder
    );

    let products = await this.cacheService.get(cacheKey);

    if (!products) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        categoryName,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      products = await this.productsService.getProductsByCreatedBy(userId, filters);
      await this.cacheService.set(cacheKey, products, 300);
    }

    return reply.send(products);
  }

  // GET /products/status/:status - Get products by status
  async getProductsByStatus(request, reply) {
    const { status } = request.params;
    const {
      page = 1,
      limit = 10,
      categoryName,
      searchTerm,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.STATUS(
      status,
      page,
      limit,
      categoryName,
      searchTerm,
      sortBy,
      sortOrder
    );

    let products = await this.cacheService.get(cacheKey);

    if (!products) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        categoryName,
        searchTerm,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      products = await this.productsService.getProductsByStatus(status, filters);
      await this.cacheService.set(cacheKey, products, 300);
    }

    return reply.send(products);
  }
}
