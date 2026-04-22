const { generateAdminToken } = require('../middleware/adminAuth.middleware');
const SubscriptionPayment = require('../models/paymentHistory.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'user_email, password are required.',
      });
    }
    if (email !== 'nilanjana' && password !== 'nilanjana') {
      return res.status(401).json({
        message: 'Invalid user credentials.',
      });
    }
    const accessToken = generateAdminToken(email);
    return res.status(200).json({
      message: 'Login successful.',
      accessToken,
    });
  } catch (err) {
    console.error('Error during user login:', err);
    return res.status(500).json({
      message: 'Internal server error.',
    });
  }
};

const VERIFIED = 'VERIFIED';

const addUserByAdmin = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_password,
      user_number,
      user_address,
      user_profession,
      user_institution,
      subscription_duration,
      subscription_price,
    } = req.body;

    // ✅ Validate required fields
    if (
      !user_name ||
      !user_email ||
      !user_password ||
      !user_number ||
      !user_address ||
      !subscription_duration ||
      !subscription_price
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email.',
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // ✅ Create user
    const user = await User.create({
      user_name,
      user_email,
      user_password: hashedPassword,
      user_number,
      user_address,
      user_profession,
      user_institution,
    });

    const userId = user._id;

    // ✅ Subscription time calculation
    const startEpoch = Date.now();
    let expiryEpoch = startEpoch;

    const durationMap = {
      '1 Month': 30,
      '6 Months': 6 * 30,
      '1 Year': 12 * 30,
    };

    if (!durationMap[subscription_duration]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription duration.',
      });
    }

    expiryEpoch += durationMap[subscription_duration] * 24 * 60 * 60 * 1000;

    // ✅ Create subscription payment record
    await SubscriptionPayment.create({
      userId,
      subscription_price,
      transactionId: 'createFromAdmin',
      subscription_duration,
      subscriptionAt: startEpoch.toString(),
      subscriptionExpiry: expiryEpoch.toString(),
      verificationStatus: VERIFIED,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully by admin.',
      data: {
        userId,
        subscriptionExpiry: expiryEpoch,
      },
    });
  } catch (error) {
    console.error('Add User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

const adminVerification = async (req, res) => {
  res.set('Cache-Control', 'no-store');

  return res.status(200).json({
    success: true,
  });
};

module.exports = { loginAdmin, addUserByAdmin, adminVerification };
