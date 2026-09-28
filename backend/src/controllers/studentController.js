const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const {
  validateEmail,
  validatePhone,
  validateScholarNumber,
  validateRoomNumber,
  validateHostel,
  validateBlock,
  validateName,
} = require('../validators/profileValidators');

// GET PROFILE: Get current student's profile
// GET /api/students/profile
// Requires: authMiddleware (authenticated user)
const getProfile = asyncHandler(async (req, res) => {
  // req.userDoc is attached by authMiddleware
  const user = req.userDoc;

  // Verify this is a student
  if (user.role !== 'student') {
    throw new AppError('Only students can access this endpoint', 403);
  }

  const profileData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    scholarNumber: user.scholarNumber,
    phone: user.phone,
    hostel: user.hostel,
    block: user.block,
    roomNumber: user.roomNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return success(res, 200, 'Profile retrieved successfully', profileData);
});

// UPDATE PROFILE: Update current student's profile
// PATCH /api/students/profile
// Body: {name, phone, hostel, block, roomNumber} (no email/password/role)
// Requires: authMiddleware (authenticated user)
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.userDoc;

  // Verify this is a student
  if (user.role !== 'student') {
    throw new AppError('Only students can access this endpoint', 403);
  }

  const { name, phone, hostel, block, roomNumber } = req.body;

  // Define which fields are allowed to be updated
  const allowedFields = ['name', 'phone', 'hostel', 'block', 'roomNumber'];

  // Check for disallowed fields (email, password, role, scholarNumber)
  const bodyKeys = Object.keys(req.body);
  const disallowedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (disallowedFields.length > 0) {
    throw new AppError(
      `Cannot modify protected fields: ${disallowedFields.join(', ')}. ` +
        `Only name, phone, hostel, block, and roomNumber can be updated.`,
      400
    );
  }

  // Validate provided fields
  const updates = {};

  if (name !== undefined) {
    if (!validateName(name)) {
      throw new AppError('Name must be 2-100 characters', 400);
    }
    updates.name = name.trim();
  }

  if (phone !== undefined) {
    if (!validatePhone(phone)) {
      throw new AppError('Phone must be a 10-digit number', 400);
    }
    updates.phone = phone.trim();
  }

  if (hostel !== undefined) {
    if (!validateHostel(hostel)) {
      throw new AppError('Hostel name is invalid (1-50 characters)', 400);
    }
    updates.hostel = hostel.trim();
  }

  if (block !== undefined) {
    if (!validateBlock(block)) {
      throw new AppError('Block name is invalid (1-50 characters)', 400);
    }
    updates.block = block.trim();
  }

  if (roomNumber !== undefined) {
    if (!validateRoomNumber(roomNumber)) {
      throw new AppError('Room number is invalid (1-20 characters)', 400);
    }
    updates.roomNumber = roomNumber.trim();
  }

  // If no valid fields provided, return error
  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }

  // Update user document
  Object.assign(user, updates);
  await user.save();

  const updatedProfile = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    scholarNumber: user.scholarNumber,
    phone: user.phone,
    hostel: user.hostel,
    block: user.block,
    roomNumber: user.roomNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return success(res, 200, 'Profile updated successfully', updatedProfile);
});

module.exports = {
  getProfile,
  updateProfile,
};
