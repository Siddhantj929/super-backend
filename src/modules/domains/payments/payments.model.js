import mongoose from 'mongoose';
import { PAYMENT_TYPE } from './payments.constants.js';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      ref: 'Order',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PAYMENT_TYPE),
      required: true,
      index: true,
    },
    installments: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ value: -1 });
paymentSchema.index({ installments: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes for common queries
paymentSchema.index({ orderId: 1, type: 1 });
paymentSchema.index({ type: 1, value: -1 });
paymentSchema.index({ orderId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
