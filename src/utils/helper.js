const jwt = require('jsonwebtoken');

const generateAccessTokenForAdmin = (email) => {
  return jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

module.exports = { generateAccessTokenForAdmin };
