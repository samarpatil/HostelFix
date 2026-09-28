const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireStudent } = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const studentController = require('../controllers/studentController');

const router = express.Router();

// All routes in this file require authentication
router.use(authMiddleware);

// Student profile endpoints
router.get('/profile', requireStudent, studentController.getProfile);
router.patch('/profile', requireStudent, studentController.updateProfile);

// Protected student-only route (test/demo)
router.get(
  '/dashboard',
  requireStudent,
  asyncHandler(async (req, res) => {
    return success(res, 200, 'Dashboard data retrieved', {
      message: 'Student dashboard data',
      studentId: req.user.id,
      hostel: req.userDoc.hostel,
    });
  })
);

module.exports = router;
