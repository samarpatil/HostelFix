const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      // Examples: 'submitted', 'review_started', 'worker_assigned',
      // 'work_started', 'marked_resolved', 'resolved_confirmed', 'rejected', 'reopened'
    },
    fromStatus: {
      type: String,
      // The status before this action (null if this is the first event)
    },
    toStatus: {
      type: String,
      // The status after this action
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // The user (admin, worker, or system) who triggered this action
      // null for system-generated events
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note must be at most 500 characters'],
      // Optional details about the action
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false } // we control timestamp, don't auto-add createdAt/updatedAt
);

// Indexes
complaintHistorySchema.index({ complaint: 1, timestamp: 1 }); // for ordered history retrieval
complaintHistorySchema.index({ performedBy: 1 });

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);

module.exports = ComplaintHistory;
