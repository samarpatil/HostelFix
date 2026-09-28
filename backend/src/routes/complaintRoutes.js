const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireStudent } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const complaintController = require('../controllers/complaintController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student complaint routes
router.post(
  '/',
  requireStudent,
  upload.single('image'), // Optional image upload
  complaintController.createComplaint
);

router.get('/my', requireStudent, complaintController.getMyComplaints);

router.get('/:id', requireStudent, complaintController.getComplaintDetail);

router.patch('/:id/cancel', requireStudent, complaintController.cancelComplaint);

module.exports = router;
