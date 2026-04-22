const User = require("../models/user.model");
const Practice = require("../models/practices.model");
const jwt = require("jsonwebtoken");
const SubscriptionPayment = require("../models/paymentHistory.model");

const registerUser = async (req, res) => {
  try {
    const { user_name, user_email, user_password, user_address, user_role } =
      req.body;

    // Validate required fields
    if (!user_name || !user_email || !user_password || !user_role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Check if passwords match
    // if (password !== con_password) {
    //   return res.status(400).json({ message: 'Passwords do not match.' });
    // }

    // Check if the user already exists
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }
    // Create new user
    const user = await User.create({
      user_name,
      user_email,
      user_password,
      user_address,
      user_role,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id },
    });
  } catch (err) {
    console.error("Error during user registration:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { user_email, user_password, deviceId } = req.body;

    if (!user_email || !user_password || !deviceId) {
      return res.status(400).json({
        message: "user_email, password and deviceId are required.",
      });
    }

    const user = await User.findOne({ user_email });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist.",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(user_password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid user credentials.",
      });
    }

    /* 🔐 SUBSCRIPTION CHECK START */
    const subscription = await SubscriptionPayment.findOne({
      userId: user._id,
      verificationStatus: "VERIFIED",
    }).sort({ subscriptionAt: -1 }); // latest subscription

    if (!subscription) {
      return res.status(403).json({
        userId: user._id,
        message: "No active subscription found.",
      });
    }

    const now = Date.now();
    const subscriptionAt = Number(subscription.subscriptionAt);
    const subscriptionExpiry = Number(subscription.subscriptionExpiry);

    if (now < subscriptionAt || now > subscriptionExpiry) {
      return res.status(403).json({
        userId: user._id,
        message: "Your subscription has expired. Please renew.",
      });
    }
    /* 🔐 SUBSCRIPTION CHECK END */

    // Ensure devices array exists
    if (!Array.isArray(user.devices)) {
      user.devices = [];
    }

    // Check if device already exists
    const deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);

    if (deviceIndex === -1) {
      if (user.devices.length >= 2) {
        return res.status(402).json({
          message: "Device limit exceeded. You can login from only 2 devices.",
        });
      }

      user.devices.push({
        deviceId,
        lastLogin: now,
      });
    } else {
      user.devices[deviceIndex].lastLogin = now;
    }

    await user.save();

    const accessToken = user.generateAccessToken();

    return res.status(200).json({
      message: "Login successful.",
      accessToken,
    });
  } catch (err) {
    console.error("Error during user login:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// controllers/doctorController.js

const bcrypt = require("bcrypt");

exports.registerDoctor = async (req, res) => {
  try {
    const {
      name,
      address,
      contactNumber,
      registrationNumber,
      email,
      username,
      role,
      password,
      practices, // array of practices
    } = req.body;

    // hash password

    // create doctor
    const doctor = await User.create({
      name,
      address,
      contactNumber,
      registrationNumber,
      email,
      username,
      role,
      password,
    });

    // create practices
    if (practices && practices.length > 0) {
      const practiceData = practices.map((p) => ({
        doctorId: doctor._id,
        name: p.name,
        address: p.address,
        dayOfWeek: p.dayOfWeek,
        fromTime: p.fromTime,
        toTime: p.toTime,
      }));

      await Practice.insertMany(practiceData);
    }

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      doctorId: doctor._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error registering doctor",
    });
  }
};

const checkUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    /* 🔐 SUBSCRIPTION CHECK START */
    const subscription = await SubscriptionPayment.findOne({
      userId: decoded._id,
      verificationStatus: "VERIFIED",
    }).sort({ subscriptionAt: -1 }); // latest subscription

    if (!subscription) {
      return res.status(403).json({
        message: "No active subscription found.",
      });
    }

    const now = Date.now();
    const subscriptionAt = Number(subscription.subscriptionAt);
    const subscriptionExpiry = Number(subscription.subscriptionExpiry);

    if (now < subscriptionAt || now > subscriptionExpiry) {
      return res.status(403).json({
        message: "Your subscription has expired. Please renew.",
      });
    }
    /* 🔐 SUBSCRIPTION CHECK END */

    return res.status(200).json({ user: decoded });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-user_password -devices") // exclude password
      .sort({ createdAt: -1 }); // latest first (optional)

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, checkUser, getAllUsers };
