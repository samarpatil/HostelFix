const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: [true, 'Complaint ID is required'],
      unique: true,
      trim: true,
      // Format: HF + timestamp-based unique ID (e.g., HF10234)
      // Generated in controller before save
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    // Denormalized student info at time of complaint submission
    // (useful for historical queries even if student record is deleted)
    scholarNumber: {
      type: String,
      required: [true, 'Scholar number is required'],
    },
    hostel: {
      type: String,
      required: [true, 'Hostel is required'],
    },
    block: {
      type: String,
      required: [true, 'Block is required'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
    },

    // Issue details
    placeOfIssue: {
      type: String,
      enum: {
        values: [
          'Room',
          'Bathroom/Toilet',
          'Corridor',
          'Common Area',
          'Mess',
          'Staircase',
          'Hostel Entrance',
          'Other',
        ],
        message: 'Invalid place of issue',
      },
      required: [true, 'Place of issue is required'],
    },
    placeOfIssueOther: {
      type: String,
      trim: true,
      // Required if placeOfIssue is 'Other'
    },
    category: {
      type: String,
      enum: {
        values: [
          'Electrical',
          'Plumbing',
          'Carpentry',
          'LAN/Internet',
          'Cleaning',
          'Civil/Building',
          'Furniture',
          'Appliance',
          'Security',
          'Other',
        ],
        message: 'Invalid category',
      },
      required: [true, 'Category is required'],
    },
    categoryOther: {
      type: String,
      trim: true,
      // Required if category is 'Other'
    },
    workerRequired: {
      type: String,
      enum: {
        values: [
          'Plumber',
          'Electrician',
          'Carpenter',
          'LAN/Network Technician',
          'Mason',
          'Cleaner',
          'AC/Appliance Technician',
          'Security',
          'Other',
        ],
        message: 'Invalid worker type',
      },
      required: [true, 'Worker type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    images: [
      {
        type: String,
        // File path or URL (local: /uploads/abc123.jpg, cloud: https://cdn.../abc123.jpg)
      },
    ],
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Emergency'],
        message: 'Invalid priority level',
      },
      default: 'Medium',
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: {
        values: [
          'SUBMITTED',
          'UNDER_REVIEW',
          'ASSIGNED',
          'IN_PROGRESS',
          'RESOLVED',
          'CLOSED',
          'REJECTED',
          'REOPENED',
        ],
        message: 'Invalid status',
      },
      default: 'SUBMITTED',
      required: [true, 'Status is required'],
    },

    // Admin/worker tracking
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
    adminRemark: {
      type: String,
      trim: true,
      maxlength: [500, 'Remark must be at most 500 characters'],
    },
    rejectionReason: {
      type: String,
      trim: true,
      // Required if status is 'REJECTED'
    },
    reopenReason: {
      type: String,
      trim: true,
      // Provided by student when they reopen a complaint
    },

    // SLA tracking (calculated based on priority at creation)
    // Low: 72 hours, Medium: 24 hours, High: 6 hours, Emergency: 2 hours
    slaDeadline: {
      type: Date,
      required: [true, 'SLA deadline is required'],
    },

    // Timestamps for lifecycle tracking
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for frequently searched and filtered fields (complaintId auto-indexes via unique)
complaintSchema.index({ student: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: 1 });
complaintSchema.index({ slaDeadline: 1 }); // for overdue queries
complaintSchema.index({ roomNumber: 1, hostel: 1 }); // for location-based reports
complaintSchema.index({ assignedWorker: 1 }); // for worker's assigned complaints

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
