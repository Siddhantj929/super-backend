import mongoose from 'mongoose';
import { ORDER_STATUS } from './orders.constants.js';

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
      index: true,
    },
    purchaseTimestamp: {
      type: Date,
      required: true,
      index: true,
    },
    approvedAt: {
      type: Date,
      index: true,
    },
    deliveredCarrierDate: {
      type: Date,
    },
    deliveredCustomerDate: {
      type: Date,
      index: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      index: true,
    },
    items: {
      type: [
        {
          productId: {
            type: String,
            required: true,
            trim: true,
            ref: 'Product',
          },
          shippingLimitDate: {
            type: Date,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
          freightValue: {
            type: Number,
            required: true,
            min: 0,
          },
          _id: false,
        },
      ],
      default: [],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// _id is automatically indexed by MongoDB
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ purchaseTimestamp: -1 });
orderSchema.index({ deliveredCustomerDate: -1 });
orderSchema.index({ estimatedDeliveryDate: 1 });
orderSchema.index({ createdAt: -1 });

// Compound indexes for common queries
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ customerId: 1, purchaseTimestamp: -1 });
orderSchema.index({ status: 1, purchaseTimestamp: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
