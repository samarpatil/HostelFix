const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no auth required)
// Note: authController functions are already wrapped with asyncHandler
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (auth required)
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
