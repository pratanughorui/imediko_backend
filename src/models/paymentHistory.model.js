const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionPaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: String, // "1 Month", "6 Months", "1 Year"
      required: true,
    },

    subscriptionAt: {
      type: String, // epoch time as string
      required: true,
    },

    subscriptionExpiry: {
      type: String, // epoch time as string
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    type: {
      type: String,
      default: 'snake',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'SubscriptionPayment',
  subscriptionPaymentSchema
);
