import Product from './products.model.js';
import { PRODUCT_STATUS, SORT_ORDER, SORT_FIELDS } from './products.constants.js';

export default class ProductsService {
  constructor() {
    // No dependencies needed for now
  }

  // Get all products with filtering and pagination
  async getAllProducts(filters) {
    const {
      page = 1,
      limit = 10,
      status,
      categoryName,
      searchTerm,
      dateRange,
      createdBy,
      sort,
    } = filters;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Category filter
    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: 'i' };
    }

    // Created by filter
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Search term filter (search in category name)
    if (searchTerm) {
      query.categoryName = { $regex: searchTerm, $options: 'i' };
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      query.createdAt = {};
      if (dateRange.from) {
        query.createdAt.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        query.createdAt.$lte = new Date(dateRange.to);
      }
    }

    // Sort options
    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions[SORT_FIELDS.CREATED_AT] = -1; // Default sort by creation date
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get product by ID
  async getProductById(id) {
    return await Product.findById(id).populate('createdBy', 'firstName lastName email').lean();
  }

  // Create new product
  async createProduct(productData) {
    const product = new Product(productData);
    const savedProduct = await product.save();
    return await Product.findById(savedProduct._id)
      .populate('createdBy', 'firstName lastName email')
      .lean();
  }

  // Update product by ID
  async updateProduct(id, updateData) {
    return await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .lean();
  }

  // Delete product by ID
  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }

  // Disable product by ID
  async disableProduct(id) {
    return await Product.findByIdAndUpdate(
      id,
      { $set: { status: PRODUCT_STATUS.DISABLED } },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .lean();
  }

  // Get products by user ID (for "my" endpoints)
  async getProductsByUserId(userId, filters = {}) {
    const { page = 1, limit = 10, status, categoryName, searchTerm, sort } = filters;

    const query = { createdBy: userId };

    if (status) {
      query.status = status;
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: 'i' };
    }

    if (searchTerm) {
      query.categoryName = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update product by ID (for specific user)
  async updateMyProduct(id, userId, updateData) {
    return await Product.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .lean();
  }

  // Disable product by ID (for specific user)
  async disableMyProduct(id, userId) {
    return await Product.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: { status: PRODUCT_STATUS.DISABLED } },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .lean();
  }

  // Get products by category
  async getProductsByCategory(categoryName, filters = {}) {
    const { page = 1, limit = 10, status, searchTerm, sort } = filters;

    const query = { categoryName: { $regex: categoryName, $options: 'i' } };

    if (status) {
      query.status = status;
    }

    if (searchTerm) {
      query.categoryName = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get products by status
  async getProductsByStatus(status, filters = {}) {
    const { page = 1, limit = 10, categoryName, searchTerm, sort } = filters;

    const query = { status };

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: 'i' };
    }

    if (searchTerm) {
      query.categoryName = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get products by creator ID
  async getProductsByCreatedBy(createdBy, filters = {}) {
    const { page = 1, limit = 10, status, categoryName, searchTerm, sort } = filters;

    const query = { createdBy };

    if (status) {
      query.status = status;
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: 'i' };
    }

    if (searchTerm) {
      query.categoryName = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
