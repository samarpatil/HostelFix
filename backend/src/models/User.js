const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Role must be either student or admin',
      },
      default: 'student',
      required: true,
    },

    // Student-only fields (sparse indexes allow these to be absent for admins)
    scholarNumber: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
      trim: true,
    },
    phone: {
      type: String,
      sparse: true,
      match: [/^[0-9]{10}$/, 'Phone must be a 10-digit number'],
    },
    hostel: {
      type: String,
      sparse: true,
      trim: true,
    },
    block: {
      type: String,
      sparse: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      sparse: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for frequently searched fields (unique fields auto-index)
userSchema.index({ role: 1 });

// Pre-save hook: hash password if modified
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: compare provided password with stored hash
userSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
