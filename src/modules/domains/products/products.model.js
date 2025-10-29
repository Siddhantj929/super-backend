import mongoose from 'mongoose';
import { PRODUCT_STATUS } from './products.constants.js';

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    nameLength: {
      type: Number,
      min: 0,
    },
    descriptionLength: {
      type: Number,
      min: 0,
    },
    photosQty: {
      type: Number,
      min: 0,
      default: 0,
    },
    weightG: {
      type: Number,
      min: 0,
    },
    lengthCm: {
      type: Number,
      min: 0,
    },
    heightCm: {
      type: Number,
      min: 0,
    },
    widthCm: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// _id is automatically indexed by MongoDB
productSchema.index({ categoryName: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ status: 1 });
productSchema.index({ createdBy: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
