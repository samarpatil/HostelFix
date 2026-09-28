const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    workerId: {
      type: String,
      required: [true, 'Worker ID is required'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone must be a 10-digit number'],
    },
    workerType: {
      type: String,
      enum: {
        values: [
          'Plumber',
          'Electrician',
          'Carpenter',
          'LAN Technician',
          'Mason',
          'Cleaner',
          'Appliance Technician',
          'Security',
          'Other',
        ],
        message: 'Invalid worker type',
      },
      required: [true, 'Worker type is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for frequently searched fields (workerId auto-indexes via unique)
workerSchema.index({ workerType: 1 });
workerSchema.index({ isActive: 1 });

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
