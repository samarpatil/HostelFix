const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    recipientRole: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Recipient role must be student or admin',
      },
      required: [true, 'Recipient role is required'],
      // Denormalized for easier filtering without joins
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      trim: true,
      // Examples: 'complaint_submitted', 'complaint_reviewed', 'worker_assigned',
      // 'complaint_in_progress', 'complaint_resolved', 'complaint_rejected',
      // 'complaint_reopened', 'emergency_complaint', 'overdue_complaint'
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message must be at most 500 characters'],
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
      // Most notifications relate to a specific complaint, some may be system-wide
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
notificationSchema.index({ recipient: 1, isRead: 1 }); // user's unread notifications
notificationSchema.index({ recipient: 1, createdAt: 1 }); // user's notification feed
notificationSchema.index({ relatedComplaint: 1 }); // all notifications for a complaint
notificationSchema.index({ createdAt: 1 }); // for cleanup/archival

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
