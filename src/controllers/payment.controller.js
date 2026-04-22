const mongoose = require('mongoose');
const SubscriptionPayment = require('../models/paymentHistory.model');
const User = require('../models/user.model');
const { sendSubscriptionApprovedMail } = require('../utils/mailHandler');
const { generatePasskey } = require('../utils/generatePasskey');

const createSubscriptionPayment = async (req, res) => {
  try {
    const { userId, amount, transactionId, duration, subscriptionAt, type } =
      req.body;

    if (
      !userId ||
      !amount ||
      !duration ||
      !subscriptionAt ||
      !transactionId ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    // ✅ static price validatio
    const PRICE_MAP = {
      '1 Month': 299,
      '6 Months': 1449,
      '1 Year': 2999,
    };

    if (!PRICE_MAP[duration]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription duration',
      });
    }

    if (Number(amount) !== PRICE_MAP[duration]) {
      return res.status(400).json({
        success: false,
        message: `Invalid amount for ${duration}. Expected ₹${PRICE_MAP[duration]}`,
      });
    }

    const startEpoch = Number(subscriptionAt);
    if (isNaN(startEpoch)) {
      return res.status(400).json({
        success: false,
        message: 'subscriptionAt must be a valid epoch time',
      });
    }

    // ✅ expiry calculation
    let expiryEpoch = startEpoch;

    switch (duration) {
      case '1 Month':
        expiryEpoch += 30 * 24 * 60 * 60 * 1000;
        break;

      case '6 Months':
        expiryEpoch += 6 * 30 * 24 * 60 * 60 * 1000;
        break;

      case '1 Year':
        expiryEpoch += 12 * 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const payment = await SubscriptionPayment.create({
      userId,
      amount,
      transactionId,
      duration,
      type,
      subscriptionAt: startEpoch.toString(),
      subscriptionExpiry: expiryEpoch.toString(),
      // verificationStatus: PENDING (default)
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { subscription_count: 1 },
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription payment created successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Subscription payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllSubscriptionPayments = async (req, res) => {
  try {
    const payments = await SubscriptionPayment.find()
      .populate('userId', 'user_name subscription_count') // adjust field as per User model
      .select('amount duration transactionId verificationStatus createdAt')
      .sort({
        verificationStatus: 1, // PENDING comes first alphabetically
        createdAt: -1,
      });

    const formattedData = payments.map((item) => ({
      id: item._id,
      user: item.userId?.user_name || 'Unknown User',
      amount: item.amount,
      subscriptionCount: item.userId?.subscription_count || 0,
      duration: item.duration,
      transactionId: item.transactionId,
      status: item.verificationStatus,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription payments',
    });
  }
};

const updateSubscriptionPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED',
      });
    }

    const payment = await SubscriptionPayment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // prevent double action
    if (payment.verificationStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed',
      });
    }

    if (status === 'APPROVED') {
      const user = await User.findById(payment.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const passkey = generatePasskey(payment._id);

      const productLink = `${process.env.PRODUCT_URL}?key=${passkey}`;
      console.log('link', productLink);
      console.log('user', user.user_email);

      await sendSubscriptionApprovedMail({
        to: user.user_email,
        userName: user.user_name,
        amount: payment.amount,
        duration: payment.duration,
        productLink,
      });
    }

    payment.verificationStatus =
      status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';

    await payment.save();

    return res.status(200).json({
      success: true,
      message: `Payment ${status.toLowerCase()} successfully`,
      data: {
        id: payment._id,
        status: payment.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
    });
  }
};
module.exports = {
  createSubscriptionPayment,
  getAllSubscriptionPayments,
  updateSubscriptionPaymentStatus,
};
