import User from './users.model.js';
import { USER_STATUS, SORT_ORDER, SORT_FIELDS } from './users.constants.js';

export default class UsersService {
  constructor() {
    // No dependencies needed for now
  }

  // Get all users with filtering and pagination
  async getAllUsers(filters) {
    const { page = 1, limit = 10, status, role, searchTerm, dateRange, location, sort } = filters;

    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Search term filter (search in firstName, lastName, email, phone)
    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
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

    // Location filter (geospatial query)
    if (location?.coordinates) {
      query['address.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.coordinates,
          },
          $maxDistance: location.radius * 1000, // Convert km to meters
        },
      };
    }

    // Sort options
    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions[SORT_FIELDS.CREATED_AT] = -1; // Default sort by creation date
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name permissions')
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(id) {
    return await User.findById(id).populate('role', 'name permissions').select('-password').lean();
  }

  // Create new user
  async createUser(userData) {
    const user = new User(userData);
    const savedUser = await user.save();
    return await User.findById(savedUser._id)
      .populate('role', 'name permissions')
      .select('-password')
      .lean();
  }

  // Update user by ID
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('role', 'name permissions')
      .select('-password')
      .lean();
  }

  // Delete user by ID
  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Disable user by ID
  async disableUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { status: USER_STATUS.DISABLED } },
      { new: true, runValidators: true }
    )
      .populate('role', 'name permissions')
      .select('-password')
      .lean();
  }

  // Get users by role ID
  async getUsersByRole(roleId, filters = {}) {
    const { page = 1, limit = 10, status, searchTerm, sort } = filters;

    const query = { role: roleId };

    if (status) {
      query.status = status;
    }

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name permissions')
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get users by status
  async getUsersByStatus(status, filters = {}) {
    const { page = 1, limit = 10, role, searchTerm, sort } = filters;

    const query = { status };

    if (role) {
      query.role = role;
    }

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sort?.field) {
      sortOptions[sort.field] = sort.order === SORT_ORDER.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name permissions')
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by email
  async getUserByEmail(email) {
    return await User.findOne({ email })
      .populate('role', 'name permissions')
      .select('-password')
      .lean();
  }

  // Get user by email with password (for authentication)
  async getUserByEmailWithPassword(email) {
    return await User.findOne({ email }).populate('role', 'name permissions');
  }

  // Get user by phone
  async getUserByPhone(phone) {
    return await User.findOne({ phone })
      .populate('role', 'name permissions')
      .select('-password')
      .lean();
  }

  // Get user by phone with password (for authentication)
  async getUserByPhoneWithPassword(phone) {
    return await User.findOne({ phone }).populate('role', 'name permissions');
  }

  // Check if email exists
  async emailExists(email, excludeId = null) {
    const query = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await User.findOne(query);
  }

  // Check if phone exists
  async phoneExists(phone, excludeId = null) {
    const query = { phone };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await User.findOne(query);
  }

  // Update user password
  async updatePassword(id, password) {
    const user = await User.findById(id);
    if (!user) return null;

    // Set password and save to trigger pre-save hook for hashing
    user.password = password;
    await user.save();

    return await User.findById(id).populate('role', 'name permissions').select('-password').lean();
  }

  // Update user last login
  async updateLastLogin(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { lastLoginAt: new Date() } },
      { new: true }
    );
    if (!user) return null;
    return await User.findById(id).populate('role', 'name permissions').select('-password').lean();
  }

  // Verify user email
  async verifyEmail(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isEmailVerified: true, status: USER_STATUS.ACTIVE } },
      { new: true, runValidators: true }
    );
    if (!user) return null;
    return await User.findById(id).populate('role', 'name permissions').select('-password').lean();
  }

  // Verify user phone
  async verifyPhone(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isPhoneVerified: true } },
      { new: true, runValidators: true }
    );
    if (!user) return null;
    return await User.findById(id).populate('role', 'name permissions').select('-password').lean();
  }

  // Verify password for a user
  async verifyPassword(userId, candidatePassword) {
    const user = await User.findById(userId);
    if (!user) return false;
    return await user.comparePassword(candidatePassword);
  }
}
