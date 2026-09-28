const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verify JWT token and attach user to request
// Usage: app.use(authMiddleware) or router.use(authMiddleware)
// After this runs, req.user will contain {id, role} from the token
// and req.userDoc will contain the full User document
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and follows "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided, please log in', 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired, please log in again', 401);
    }
    throw new AppError('Invalid token, please log in again', 401);
  }

  // Attach decoded token data to request
  req.user = decoded; // {id, role}

  // Also load full user document from DB (optional, used for getting user details)
  // If user is deleted but token still valid, this will fail
  const userDoc = await User.findById(decoded.id);
  if (!userDoc) {
    throw new AppError('User not found', 401);
  }

  req.userDoc = userDoc; // Full user object

  next();
});

module.exports = authMiddleware;
