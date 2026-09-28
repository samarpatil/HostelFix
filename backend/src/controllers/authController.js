const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

// REGISTER: Create a new student account
// POST /api/auth/register
// Body: {name, email, password, scholarNumber, phone, hostel, block, roomNumber}
const register = asyncHandler(async (req, res) => {
  const { name, email, password, scholarNumber, phone, hostel, block, roomNumber } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (!scholarNumber || !hostel || !block || !roomNumber) {
    throw new AppError(
      'Scholar number, hostel, block, and room number are required for students',
      400
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { scholarNumber }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Scholar number';
    throw new AppError(`${field} already in use`, 409);
  }

  // Create new student
  const user = await User.create({
    name,
    email,
    password, // Will be hashed by pre-save hook
    scholarNumber,
    phone,
    hostel,
    block,
    roomNumber,
    role: 'student',
  });

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Return user (without password) and token
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    scholarNumber: user.scholarNumber,
    hostel: user.hostel,
    block: user.block,
    roomNumber: user.roomNumber,
  };

  return success(res, 201, 'Student registered successfully', {
    user: userResponse,
    token,
  });
});

// LOGIN: Authenticate a user (student or admin)
// POST /api/auth/login
// Body: {email, password}
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user by email (select password since it's normally hidden)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare passwords
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Return user (without password) and token
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.role === 'student' && {
      scholarNumber: user.scholarNumber,
      hostel: user.hostel,
      block: user.block,
      roomNumber: user.roomNumber,
    }),
  };

  return success(res, 200, 'Login successful', {
    user: userResponse,
    token,
  });
});

// GET ME: Get current authenticated user
// GET /api/auth/me
// Headers: Authorization: Bearer <token>
const getMe = asyncHandler(async (req, res) => {
  // req.userDoc is attached by authMiddleware
  const user = req.userDoc;

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.role === 'student' && {
      scholarNumber: user.scholarNumber,
      phone: user.phone,
      hostel: user.hostel,
      block: user.block,
      roomNumber: user.roomNumber,
    }),
  };

  return success(res, 200, 'User retrieved successfully', userResponse);
});

// LOGOUT: Invalidate session (client-side only, no backend state)
// POST /api/auth/logout
// In a stateless JWT system, logout is client-side (delete token from localStorage).
// This endpoint exists for completeness and can be used for server-side cleanup
// if needed (e.g., token blacklist, audit logging).
const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: server doesn't maintain session state.
  // Client must delete token from localStorage/sessionStorage.
  // This endpoint can be used for audit logging, token blacklisting, etc.

  return success(res, 200, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  getMe,
  logout,
};
