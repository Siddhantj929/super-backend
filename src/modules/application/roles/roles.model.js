import mongoose from 'mongoose';
import { ROLE_STATUS } from './roles.constants.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: Object.values(ROLE_STATUS),
      default: ROLE_STATUS.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function (permissions) {
          return permissions.every(
            permission => typeof permission === 'string' && permission.trim().length > 0
          );
        },
        message: 'All permissions must be non-empty strings',
      },
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
roleSchema.index({ status: 1 });
roleSchema.index({ createdBy: 1 });
roleSchema.index({ businessId: 1 });
roleSchema.index({ createdAt: -1 });

const Role = mongoose.model('Role', roleSchema);

export default Role;
