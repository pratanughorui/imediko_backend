const { mongoose, Schema } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new Schema(
  {
    user_name: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
    },
    user_email: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    user_address: {
      type: String,
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      require: true,
      trim: true,
    },
    user_role: {
      type: String,
      lowercase: true,
      require: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      lowercase: true,
      trim: true,
    },
    user_password: {
      type: String,
      require: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("user_password")) return; // Use 'this' correctly
  this.user_password = await bcrypt.hash(this.user_password, 10); // Await the hash operation
});

// Instance method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (user_password) {
  return await bcrypt.compare(user_password, this.user_password);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};
const user = mongoose.model("User", userSchema);
module.exports = user;
