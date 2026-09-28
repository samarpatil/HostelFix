const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const router = express.Router();

// All routes in this file require authentication AND admin role
router.use(authMiddleware);

// Admin-only dashboard
router.get(
  '/dashboard',
  requireAdmin,
  asyncHandler(async (req, res) => {
    return success(res, 200, 'Admin dashboard data retrieved', {
      message: `Hello ${req.userDoc.name}, welcome to admin dashboard!`,
      role: req.user.role,
      adminId: req.user.id,
    });
  })
);

// Admin-only worker management (placeholder)
router.get(
  '/workers',
  requireAdmin,
  asyncHandler(async (req, res) => {
    return success(res, 200, 'Workers retrieved', {
      message: 'List of all workers (Phase 7)',
      workers: [],
    });
  })
);

module.exports = router;
