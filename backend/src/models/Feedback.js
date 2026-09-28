const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint reference is required'],
      unique: true, // only one feedback per complaint
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment must be at most 500 characters'],
    },
  },
  { timestamps: true }
);

// Indexes (complaint auto-indexes via unique)
feedbackSchema.index({ student: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
