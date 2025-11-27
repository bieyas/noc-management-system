const jwt = require('jsonwebtoken');
const config = require('../config/app');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Verify JWT Token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};
