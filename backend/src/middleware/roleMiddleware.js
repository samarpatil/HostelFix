const AppError = require('../utils/AppError');

// Higher-order function: returns middleware that checks if user has required role
// Usage: router.get('/admin-only', requireRole('admin'), controller)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('You do not have permission to access this resource', 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Convenience middleware for admin-only routes
const requireAdmin = requireRole('admin');

// Convenience middleware for student-only routes
const requireStudent = requireRole('student');

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent,
};
