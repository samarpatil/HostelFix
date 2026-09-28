const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Generate a JWT token for a user
function generateToken(userId, role) {
  const payload = {
    id: userId,
    role: role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return token;
}

module.exports = generateToken;
