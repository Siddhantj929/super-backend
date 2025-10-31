#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to convert to PascalCase
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => capitalize(word))
    .join('');
}

// Helper function to convert to camelCase
function toCamelCase(str) {
  const parts = str.split(/[-_]/);
  return (
    parts[0] +
    parts
      .slice(1)
      .map(word => capitalize(word))
      .join('')
  );
}

// Parse CLI arguments
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Module path is required');
    console.log('Usage: node module.create.js <type>/<module-name>');
    console.log('Example: node module.create.js domains/business');
    process.exit(1);
  }

  const modulePath = args[0];
  const parts = modulePath.split('/');

  if (parts.length !== 2) {
    console.error('Error: Invalid module path format');
    console.log('Expected format: <type>/<module-name>');
    console.log('Example: domains/business or application/analytics');
    process.exit(1);
  }

  const [type, moduleName] = parts;

  // Validate type
  if (!['application', 'domains'].includes(type)) {
    console.error(`Error: Invalid module type "${type}"`);
    console.log('Type must be either "application" or "domains"');
    process.exit(1);
  }

  // Validate module name
  if (!moduleName || moduleName.trim() === '') {
    console.error('Error: Module name cannot be empty');
    process.exit(1);
  }

  // Check if module name is valid (alphanumeric, dashes, underscores)
  if (!/^[a-z0-9_-]+$/.test(moduleName)) {
    console.error(`Error: Invalid module name "${moduleName}"`);
    console.log(
      'Module name should only contain lowercase letters, numbers, dashes, and underscores'
    );
    process.exit(1);
  }

  return { type, moduleName };
}

// Check if module already exists
function checkModuleExists(type, moduleName) {
  const modulesPath = path.resolve(__dirname, '../modules', type, moduleName);

  if (fs.existsSync(modulesPath)) {
    console.error(`Error: Module "${moduleName}" already exists at ${modulesPath}`);
    process.exit(1);
  }

  return modulesPath;
}

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate constants file
function generateConstantsFile(moduleName) {
  const className = toPascalCase(moduleName);
  const upperModuleName = moduleName.toUpperCase().replace(/-/g, '_');

  return `// ${className} status constants (customize as needed)
export const ${upperModuleName}_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

// Sort order
export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

// Sort fields
export const SORT_FIELDS = Object.freeze({
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
});

// Cache keys
export const CACHE_KEYS = Object.freeze({
  SINGLE: id => \`${moduleName}:single:\${id}\`,
  LIST: (page, limit, sortBy, sortOrder) =>
    \`${moduleName}:list:\${page}:\${limit}:\${sortBy}:\${sortOrder}\`,
  USER_ITEMS: (userId, page, limit, status, sortBy, sortOrder) =>
    \`${moduleName}:user-items:\${userId}:\${page}:\${limit}:\${status || 'all'}:\${sortBy}:\${sortOrder}\`,
});

// Cache patterns
export const CACHE_PATTERNS = Object.freeze({
  LIST: '${moduleName}:list:*',
  USER: userId => \`${moduleName}:user:\${userId}*\`,
});
`;
}

// Generate model file
function generateModelFile(moduleName) {
  const className = toPascalCase(moduleName);
  const schemaName = toCamelCase(moduleName) + 'Schema';
  const upperModuleName = moduleName.toUpperCase().replace(/-/g, '_');

  return `import mongoose from 'mongoose';
import { ${upperModuleName}_STATUS } from './${moduleName}.constants.js';

const ${schemaName} = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(${upperModuleName}_STATUS),
      default: ${upperModuleName}_STATUS.ACTIVE,
    },
    createdBy: {
      type: String,
      trim: true,
      ref: 'User',
    },
    // Add your custom fields here
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
${schemaName}.index({ status: 1 });
${schemaName}.index({ createdAt: -1 });
${schemaName}.index({ createdBy: 1 }, { sparse: true });

// Compound indexes for common queries
${schemaName}.index({ createdBy: 1, status: 1 }, { sparse: true });
${schemaName}.index({ createdBy: 1, createdAt: -1 }, { sparse: true });

const ${className} = mongoose.model('${className}', ${schemaName});

export default ${className};
`;
}

// Generate service file
function generateServiceFile(moduleName) {
  const className = toPascalCase(moduleName);

  return `import ${className} from './${moduleName}.model.js';
import { SORT_ORDER, SORT_FIELDS } from './${moduleName}.constants.js';

export default class ${className}Service {
  constructor() {
    // No dependencies needed for now
  }

  // Get all ${moduleName} with filtering and pagination
  async getAll${className}s(filters) {
    const { page = 1, limit = 10, status, sort } = filters;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Sort options
    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions[SORT_FIELDS.CREATED_AT] = -1;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ${className}.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ${className}.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get ${moduleName} by ID
  async get${className}ById(id) {
    return await ${className}.findById(id).lean();
  }

  // Create new ${moduleName}
  async create${className}(data) {
    const item = new ${className}(data);
    return await item.save();
  }

  // Update ${moduleName} by ID
  async update${className}(id, updateData) {
    return await ${className}.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  // Delete ${moduleName} by ID
  async delete${className}(id) {
    return await ${className}.findByIdAndDelete(id);
  }

  // Disable ${moduleName} by ID
  async disable${className}(id) {
    return await ${className}.findByIdAndUpdate(
      id,
      { $set: { status: 'inactive' } },
      { new: true, runValidators: true }
    ).lean();
  }

  // Get ${moduleName} by createdBy (user ID)
  async get${className}sByCreatedBy(createdBy, filters = {}) {
    const { page = 1, limit = 10, status, sort } = filters;

    const query = { createdBy };

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ${className}.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ${className}.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update ${moduleName} by ID (for specific user)
  async updateMy${className}(id, createdBy, updateData) {
    return await ${className}.findOneAndUpdate(
      { _id: id, createdBy: createdBy },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  // Disable ${moduleName} by ID (for specific user)
  async disableMy${className}(id, createdBy) {
    return await ${className}.findOneAndUpdate(
      { _id: id, createdBy: createdBy },
      { $set: { status: 'inactive' } },
      { new: true, runValidators: true }
    ).lean();
  }
}
`;
}

// Generate controller file
function generateControllerFile(moduleName) {
  const className = toPascalCase(moduleName);
  const serviceName = toCamelCase(moduleName) + 'Service';

  return `import { CACHE_KEYS, CACHE_PATTERNS, SORT_FIELDS, SORT_ORDER } from './${moduleName}.constants.js';
import { notFound } from '../../../utils/http-errors.js';

export default class ${className}Controller {
  constructor({ ${serviceName}, cacheService }) {
    this.${serviceName} = ${serviceName};
    this.cacheService = cacheService;
  }

  // GET /${moduleName} - Get all ${moduleName}
  async getAll${className}s(request, reply) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.LIST(page, limit, sortBy, sortOrder);

    let result = await this.cacheService.get(cacheKey);

    if (!result) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      result = await this.${serviceName}.getAll${className}s(filters);
      await this.cacheService.set(cacheKey, result, 300);
    }

    return reply.send(result);
  }

  // GET /${moduleName}/:id - Get ${moduleName} by ID
  async get${className}ById(request, reply) {
    const { id } = request.params;
    const cacheKey = CACHE_KEYS.SINGLE(id);

    let item = await this.cacheService.get(cacheKey);

    if (!item) {
      item = await this.${serviceName}.get${className}ById(id);
      if (!item) throw notFound('${className} not found');
      await this.cacheService.set(cacheKey, item, 600);
    }

    return reply.send(item);
  }

  // POST /${moduleName} - Create new ${moduleName}
  async create${className}(request, reply) {
    const data = {
      ...request.body,
      createdBy: request.user._id,
    };
    const item = await this.${serviceName}.create${className}(data);

    reply.status(201).send(item);

    setImmediate(async () => {
      try {
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (item.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.USER(item.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for ${moduleName} creation:', error);
      }
    });
  }

  // PATCH /${moduleName}/:id - Update ${moduleName} by ID
  async update${className}(request, reply) {
    const { id } = request.params;
    const updateData = request.body;
    const item = await this.${serviceName}.update${className}(id, updateData);
    if (!item) throw notFound('${className} not found');

    reply.send(item);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (item.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.USER(item.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for ${moduleName} update:', error);
      }
    });
  }

  // DELETE /${moduleName}/:id - Delete ${moduleName} by ID
  async delete${className}(request, reply) {
    const { id } = request.params;
    const deleted = await this.${serviceName}.delete${className}(id);
    if (!deleted) throw notFound('${className} not found');

    reply.status(204).send();

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (deleted.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.USER(deleted.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for ${moduleName} deletion:', error);
      }
    });
  }

  // PATCH /${moduleName}/:id/disable - Disable ${moduleName} by ID
  async disable${className}(request, reply) {
    const { id } = request.params;
    const item = await this.${serviceName}.disable${className}(id);
    if (!item) throw notFound('${className} not found');

    reply.send(item);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        if (item.createdBy) {
          await this.cacheService.deletePattern(CACHE_PATTERNS.USER(item.createdBy));
        }
      } catch (error) {
        console.error('Cache invalidation failed for ${moduleName} disable:', error);
      }
    });
  }

  // GET /${moduleName}/me - Get current user's ${moduleName}
  async getMy${className}s(request, reply) {
    const userId = request.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = SORT_FIELDS.CREATED_AT,
      sortOrder = SORT_ORDER.DESC,
    } = request.query;

    const cacheKey = CACHE_KEYS.USER_ITEMS(userId, page, limit, status, sortBy, sortOrder);

    let result = await this.cacheService.get(cacheKey);

    if (!result) {
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        sort: {
          field: sortBy,
          order: sortOrder,
        },
      };

      result = await this.${serviceName}.get${className}sByCreatedBy(userId, filters);
      await this.cacheService.set(cacheKey, result, 300);
    }

    return reply.send(result);
  }

  // PATCH /${moduleName}/me/:id - Update current user's ${moduleName}
  async updateMy${className}(request, reply) {
    const userId = request.user._id;
    const { id } = request.params;
    const updateData = request.body;

    const item = await this.${serviceName}.updateMy${className}(id, userId, updateData);
    if (!item) throw notFound('${className} not found or you do not have permission to update it');

    reply.send(item);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.USER(userId));
      } catch (error) {
        console.error('Cache invalidation failed for my ${moduleName} update:', error);
      }
    });
  }

  // PATCH /${moduleName}/me/:id/disable - Disable current user's ${moduleName}
  async disableMy${className}(request, reply) {
    const userId = request.user._id;
    const { id } = request.params;

    const item = await this.${serviceName}.disableMy${className}(id, userId);
    if (!item) throw notFound('${className} not found or you do not have permission to disable it');

    reply.send(item);

    setImmediate(async () => {
      try {
        await this.cacheService.delete(CACHE_KEYS.SINGLE(id));
        await this.cacheService.deletePattern(CACHE_PATTERNS.LIST);
        await this.cacheService.deletePattern(CACHE_PATTERNS.USER(userId));
      } catch (error) {
        console.error('Cache invalidation failed for my ${moduleName} disable:', error);
      }
    });
  }
}
`;
}

// Generate DTOs file
function generateDtosFile(moduleName) {
  const className = toPascalCase(moduleName);
  const upperModuleName = moduleName.toUpperCase().replace(/-/g, '_');

  return `import { ${upperModuleName}_STATUS, SORT_ORDER, SORT_FIELDS } from './${moduleName}.constants.js';

// GET /${moduleName} - Get all ${moduleName}
export const getAll${className}s = {
  summary: 'Get all ${moduleName}',
  tags: ['${className}'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(${upperModuleName}_STATUS) },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// GET /${moduleName}/:id - Get ${moduleName} by ID
export const get${className}ById = {
  summary: 'Get ${moduleName} by ID',
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// POST /${moduleName} - Create new ${moduleName}
export const create${className} = {
  summary: 'Create new ${moduleName}',
  tags: ['${className}'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      status: { type: 'string', enum: Object.values(${upperModuleName}_STATUS) },
      // Add your custom fields here
    },
    required: ['name'],
  },
};

// PATCH /${moduleName}/:id - Update ${moduleName} by ID
export const update${className} = {
  summary: 'Update ${moduleName} by ID',
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      status: { type: 'string', enum: Object.values(${upperModuleName}_STATUS) },
      // Add your custom fields here
    },
  },
};

// DELETE /${moduleName}/:id - Delete ${moduleName} by ID
export const delete${className} = {
  summary: 'Delete ${moduleName} by ID',
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// PATCH /${moduleName}/:id/disable - Disable ${moduleName} by ID
export const disable${className} = {
  summary: 'Disable ${moduleName} by ID',
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};

// GET /${moduleName}/me - Get current user's ${moduleName}
export const getMy${className}s = {
  summary: "Get current user's ${moduleName}",
  tags: ['${className}'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: Object.values(${upperModuleName}_STATUS) },
      sortBy: { type: 'string', default: SORT_FIELDS.CREATED_AT },
      sortOrder: { type: 'string', enum: Object.values(SORT_ORDER), default: SORT_ORDER.DESC },
    },
  },
};

// PATCH /${moduleName}/me/:id - Update current user's ${moduleName}
export const updateMy${className} = {
  summary: "Update current user's ${moduleName}",
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      status: { type: 'string', enum: Object.values(${upperModuleName}_STATUS) },
      // Add your custom fields here
    },
  },
};

// PATCH /${moduleName}/me/:id/disable - Disable current user's ${moduleName}
export const disableMy${className} = {
  summary: "Disable current user's ${moduleName}",
  tags: ['${className}'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
};
`;
}

// Generate routes file
function generateRoutesFile(moduleName) {
  const className = toPascalCase(moduleName);
  const controllerName = toCamelCase(moduleName) + 'Controller';
  const routesFunctionName = toCamelCase(moduleName) + 'Routes';

  return `import fp from 'fastify-plugin';
import { controller } from '../../../utils/controller.js';
import {
  getAll${className}s,
  get${className}ById,
  create${className},
  update${className},
  delete${className},
  disable${className},
  getMy${className}s,
  updateMy${className},
  disableMy${className},
} from './${moduleName}.dtos.js';

async function ${routesFunctionName}(fastify, opts) {
  // GET /${moduleName} - Get all ${moduleName}
  fastify.get('/${moduleName}', {
    schema: { ...getAll${className}s },
    handler: controller('${controllerName}', 'getAll${className}s'),
  });

  // GET /${moduleName}/me - Get current user's ${moduleName}
  fastify.get('/${moduleName}/me', {
    schema: { ...getMy${className}s },
    handler: controller('${controllerName}', 'getMy${className}s'),
  });

  // PATCH /${moduleName}/me/:id - Update current user's ${moduleName}
  fastify.patch('/${moduleName}/me/:id', {
    schema: { ...updateMy${className} },
    handler: controller('${controllerName}', 'updateMy${className}'),
  });

  // PATCH /${moduleName}/me/:id/disable - Disable current user's ${moduleName}
  fastify.patch('/${moduleName}/me/:id/disable', {
    schema: { ...disableMy${className} },
    handler: controller('${controllerName}', 'disableMy${className}'),
  });

  // GET /${moduleName}/:id - Get ${moduleName} by ID
  fastify.get('/${moduleName}/:id', {
    schema: { ...get${className}ById },
    handler: controller('${controllerName}', 'get${className}ById'),
  });

  // POST /${moduleName} - Create new ${moduleName}
  fastify.post('/${moduleName}', {
    schema: { ...create${className} },
    handler: controller('${controllerName}', 'create${className}'),
  });

  // PATCH /${moduleName}/:id - Update ${moduleName} by ID
  fastify.patch('/${moduleName}/:id', {
    schema: { ...update${className} },
    handler: controller('${controllerName}', 'update${className}'),
  });

  // DELETE /${moduleName}/:id - Delete ${moduleName} by ID
  fastify.delete('/${moduleName}/:id', {
    schema: { ...delete${className} },
    handler: controller('${controllerName}', 'delete${className}'),
  });

  // PATCH /${moduleName}/:id/disable - Disable ${moduleName} by ID
  fastify.patch('/${moduleName}/:id/disable', {
    schema: { ...disable${className} },
    handler: controller('${controllerName}', 'disable${className}'),
  });
}

export default fp(${routesFunctionName}, {
  name: '${moduleName}-routes',
});
`;
}

// Generate migration 001_setup.js (empty file)
function generateSetupMigration() {
  return '';
}

// Generate migration 002_imports.js
function generateImportsMigration(moduleName) {
  const className = toPascalCase(moduleName);

  return `import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ${className} from '../${moduleName}.model.js';
import { connect } from '../../../../database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Read CSV file and return parsed data
async function readCSVFile(filePath, dataMapper) {
  return new Promise((resolve, reject) => {
    const data = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers = [];
    let isFirstLine = true;

    rl.on('line', line => {
      if (isFirstLine) {
        headers = parseCSVLine(line);
        isFirstLine = false;
      } else if (line.trim()) {
        const values = parseCSVLine(line);
        const record = dataMapper(headers, values);

        if (record) {
          data.push(record);
        }
      }
    });

    rl.on('close', () => {
      resolve(data);
    });

    rl.on('error', error => {
      reject(error);
    });
  });
}

// Map CSV data to model object
function mapData(headers, values) {
  const item = {};

  headers.forEach((header, index) => {
    const value = values[index];
    // Customize the mapping based on your CSV structure
    // Example:
    // switch (header) {
    //   case 'csv_field_name':
    //     item.modelField = value || null;
    //     break;
    // }
  });

  return item;
}

async function runMigration() {
  try {
    console.log('Starting ${moduleName} import migration...');

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Path to CSV file
    const csvPath = join(__dirname, '../files/data.csv');
    console.log(\`Reading CSV from: \${csvPath}\`);

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      console.warn(\`CSV file not found at \${csvPath}\`);
      console.log('Skipping import migration');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Read and parse CSV file
    console.log('\\nReading CSV...');
    const items = await readCSVFile(csvPath, mapData);
    console.log(\`Parsed \${items.length} items from CSV\`);

    if (items.length === 0) {
      console.log('No items to import');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Prepare bulk operations
    console.log('\\nPreparing bulk operations...');
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: item },
        upsert: true,
      },
    }));

    // Execute bulk write
    const BATCH_SIZE = 1000;
    let totalInserted = 0;
    let totalUpdated = 0;

    console.log(\`Executing bulk operations in batches of \${BATCH_SIZE}...\`);

    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      const result = await ${className}.bulkWrite(batch, { ordered: false });

      totalInserted += result.upsertedCount || 0;
      totalUpdated += result.modifiedCount || 0;

      console.log(
        \`  Batch \${Math.floor(i / BATCH_SIZE) + 1}: Processed \${Math.min(i + BATCH_SIZE, bulkOps.length)}/\${bulkOps.length} items\`
      );
    }

    console.log(\`\\nBulk operation completed:\`);
    console.log(\`  - \${totalInserted} items created\`);
    console.log(\`  - \${totalUpdated} items updated\`);

    // Display summary
    const totalCount = await ${className}.countDocuments();
    console.log(\`\\nTotal ${moduleName} in database: \${totalCount}\`);

    console.log('\\nMigration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  runMigration();
}

export default runMigration;
`;
}

// Main function to create the module
function createModule() {
  console.log('=== Module Generator ===\n');

  // Parse arguments
  const { type, moduleName } = parseArguments();
  console.log(`Creating module: ${type}/${moduleName}`);

  // Check if module exists
  const modulePath = checkModuleExists(type, moduleName);
  console.log(`Module path: ${modulePath}`);

  // Create directory structure
  console.log('\nCreating directory structure...');
  ensureDir(modulePath);
  ensureDir(path.join(modulePath, 'migrations'));
  ensureDir(path.join(modulePath, 'files'));
  console.log('✓ Directories created');

  // Generate files
  console.log('\nGenerating files...');

  const files = [
    {
      name: `${moduleName}.constants.js`,
      content: generateConstantsFile(moduleName),
    },
    {
      name: `${moduleName}.model.js`,
      content: generateModelFile(moduleName),
    },
    {
      name: `${moduleName}.service.js`,
      content: generateServiceFile(moduleName),
    },
    {
      name: `${moduleName}.controller.js`,
      content: generateControllerFile(moduleName),
    },
    {
      name: `${moduleName}.dtos.js`,
      content: generateDtosFile(moduleName),
    },
    {
      name: `${moduleName}.routes.js`,
      content: generateRoutesFile(moduleName),
    },
    {
      name: 'migrations/001_setup.js',
      content: generateSetupMigration(),
    },
    {
      name: 'migrations/002_imports.js',
      content: generateImportsMigration(moduleName),
    },
  ];

  files.forEach(file => {
    const filePath = path.join(modulePath, file.name);
    fs.writeFileSync(filePath, file.content, 'utf8');
    console.log(`✓ Created ${file.name}`);
  });

  // Create .gitkeep in files folder to ensure it's tracked
  const gitkeepPath = path.join(modulePath, 'files', '.gitkeep');
  fs.writeFileSync(gitkeepPath, '', 'utf8');
  console.log('✓ Created files/.gitkeep');

  console.log('\n=== Module created successfully! ===');
  console.log(`\nLocation: ${modulePath}`);
  console.log('\nFiles created:');
  console.log(`  - ${moduleName}.constants.js`);
  console.log(`  - ${moduleName}.model.js`);
  console.log(`  - ${moduleName}.service.js`);
  console.log(`  - ${moduleName}.controller.js`);
  console.log(`  - ${moduleName}.dtos.js`);
  console.log(`  - ${moduleName}.routes.js`);
  console.log(`  - migrations/001_setup.js`);
  console.log(`  - migrations/002_imports.js`);
  console.log(`  - files/ (directory for data files)`);
  console.log('\nNext steps:');
  console.log('1. Customize the model schema in the .model.js file');
  console.log('2. Update the service methods if needed');
  console.log('3. Customize the DTOs for your endpoints');
  console.log('4. Add any custom fields to constants');
  console.log('5. Register the module in your application');
}

// Run the script
createModule();
