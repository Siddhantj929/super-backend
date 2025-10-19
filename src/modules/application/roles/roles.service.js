import Role from './roles.model.js';
import { ROLE_STATUS, SORT_ORDER, SORT_FIELDS } from './roles.constants.js';

export default class RolesService {
  constructor() {
    // No dependencies needed for now
  }

  // Get all roles with filtering and pagination
  async getAllRoles(filters) {
    const { page = 1, limit = 10, status, businessId, searchTerm, dateRange, sort } = filters;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Business ID filter
    if (businessId) {
      query.businessId = businessId;
    }

    // Search term filter (search in name)
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
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

    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('businessId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Role.countDocuments(query),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get role by ID
  async getRoleById(id) {
    return await Role.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('businessId', 'name')
      .lean();
  }

  // Create new role
  async createRole(roleData) {
    const role = new Role(roleData);
    return await role.save();
  }

  // Update role by ID
  async updateRole(id, updateData) {
    return await Role.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('businessId', 'name')
      .lean();
  }

  // Delete role by ID
  async deleteRole(id) {
    return await Role.findByIdAndDelete(id);
  }

  // Disable role by ID
  async disableRole(id) {
    return await Role.findByIdAndUpdate(
      id,
      { $set: { status: ROLE_STATUS.DISABLED } },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('businessId', 'name')
      .lean();
  }

  // Get roles by business ID
  async getRolesByBusinessId(businessId, filters = {}) {
    const { page = 1, limit = 10, status, searchTerm, sort } = filters;

    const query = { businessId };

    if (status) {
      query.status = status;
    }

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Role.countDocuments(query),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get roles by creator ID
  async getRolesByCreatedBy(createdBy, filters = {}) {
    const { page = 1, limit = 10, status, businessId, searchTerm, sort } = filters;

    const query = { createdBy };

    if (status) {
      query.status = status;
    }

    if (businessId) {
      query.businessId = businessId;
    }

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('businessId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Role.countDocuments(query),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Check if role name exists
  async roleNameExists(name, excludeId = null) {
    const query = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Role.findOne(query);
  }

  // Get role by name
  async getRoleByName(name) {
    return await Role.findOne({ name })
      .populate('createdBy', 'firstName lastName email')
      .populate('businessId', 'name')
      .lean();
  }

  // Update role permissions
  async updateRolePermissions(id, permissions) {
    return await Role.findByIdAndUpdate(
      id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('businessId', 'name')
      .lean();
  }

  // Get roles with specific permission
  async getRolesByPermission(permission, filters = {}) {
    const { page = 1, limit = 10, status, businessId, sort } = filters;

    const query = { permissions: permission };

    if (status) {
      query.status = status;
    }

    if (businessId) {
      query.businessId = businessId;
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('businessId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Role.countDocuments(query),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
