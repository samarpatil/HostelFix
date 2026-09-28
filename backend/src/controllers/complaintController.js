const { Complaint, ComplaintHistory } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const {
  validateTitle,
  validateDescription,
  validateCategory,
  validateCategoryOther,
  validatePlaceOfIssue,
  validatePlaceOfIssueOther,
  validateWorkerRequired,
  validatePriority,
  validateImageFile,
  calculateSLADeadline,
  generateComplaintId,
} = require('../validators/complaintValidators');

// CREATE COMPLAINT: Student submits a new complaint
// POST /api/complaints
// Requires: authMiddleware + requireStudent
const createComplaint = asyncHandler(async (req, res) => {
  const student = req.userDoc;

  // Verify student
  if (student.role !== 'student') {
    throw new AppError('Only students can create complaints', 403);
  }

  const {
    title,
    description,
    category,
    categoryOther,
    placeOfIssue,
    placeOfIssueOther,
    workerRequired,
    priority,
  } = req.body;

  // Validate all required fields
  if (!validateTitle(title)) {
    throw new AppError('Title must be 5-100 characters', 400);
  }

  if (!validateDescription(description)) {
    throw new AppError('Description must be 10-1000 characters', 400);
  }

  if (!validateCategory(category)) {
    throw new AppError('Invalid category', 400);
  }

  if (category === 'Other' && !validateCategoryOther(categoryOther, category)) {
    throw new AppError('Please specify the category when selecting Other', 400);
  }

  if (!validatePlaceOfIssue(placeOfIssue)) {
    throw new AppError('Invalid place of issue', 400);
  }

  if (placeOfIssue === 'Other' && !validatePlaceOfIssueOther(placeOfIssueOther, placeOfIssue)) {
    throw new AppError('Please specify the location when selecting Other', 400);
  }

  if (!validateWorkerRequired(workerRequired)) {
    throw new AppError('Invalid worker type', 400);
  }

  if (!validatePriority(priority)) {
    throw new AppError('Invalid priority level', 400);
  }

  // Validate image if provided
  if (req.file && !validateImageFile(req.file)) {
    throw new AppError('Invalid image file (must be JPG/PNG, max 5MB)', 400);
  }

  // Generate complaint ID
  const complaintId = generateComplaintId();

  // Calculate SLA deadline based on priority
  const slaDeadline = calculateSLADeadline(priority);

  // Get current images array (from uploaded file)
  const images = req.file ? [`/uploads/${req.file.filename}`] : [];

  // Create complaint with auto-populated student info
  const complaint = await Complaint.create({
    complaintId,
    student: student._id,
    scholarNumber: student.scholarNumber,
    hostel: student.hostel,
    block: student.block,
    roomNumber: student.roomNumber,
    placeOfIssue,
    placeOfIssueOther: placeOfIssue === 'Other' ? placeOfIssueOther : undefined,
    category,
    categoryOther: category === 'Other' ? categoryOther : undefined,
    workerRequired,
    title: title.trim(),
    description: description.trim(),
    images,
    priority,
    status: 'SUBMITTED',
    slaDeadline,
  });

  // Record in complaint history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'submitted',
    toStatus: 'SUBMITTED',
    performedBy: student._id,
    note: 'Student submitted complaint via web',
  });

  const complaintResponse = {
    id: complaint._id,
    complaintId: complaint.complaintId,
    title: complaint.title,
    status: complaint.status,
    priority: complaint.priority,
    category: complaint.category,
    createdAt: complaint.createdAt,
  };

  return success(res, 201, 'Complaint created successfully', complaintResponse);
});

// GET MY COMPLAINTS: Student views their own complaints
// GET /api/complaints/my
// Requires: authMiddleware + requireStudent
const getMyComplaints = asyncHandler(async (req, res) => {
  const student = req.userDoc;

  // Verify student
  if (student.role !== 'student') {
    throw new AppError('Only students can view their complaints', 403);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filters
  const filters = { student: student._id };

  if (req.query.status) {
    const statusList = req.query.status.split(',');
    filters.status = { $in: statusList };
  }

  if (req.query.priority) {
    filters.priority = req.query.priority;
  }

  if (req.query.category) {
    filters.category = req.query.category;
  }

  // Fetch complaints
  const complaints = await Complaint.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Complaint.countDocuments(filters);

  const complaintList = complaints.map((c) => ({
    id: c._id,
    complaintId: c.complaintId,
    title: c.title,
    description: c.description.substring(0, 100) + '...',
    category: c.category,
    priority: c.priority,
    status: c.status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return success(res, 200, 'Complaints retrieved successfully', {
    complaints: complaintList,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// GET COMPLAINT DETAIL: Student views specific complaint
// GET /api/complaints/:id
// Requires: authMiddleware + requireStudent
const getComplaintDetail = asyncHandler(async (req, res) => {
  const student = req.userDoc;
  const { id } = req.params;

  // Verify student
  if (student.role !== 'student') {
    throw new AppError('Only students can view complaints', 403);
  }

  // Find complaint
  const complaint = await Complaint.findById(id)
    .populate('student', 'name email scholarNumber hostel block roomNumber')
    .populate('assignedWorker', 'name workerId phone workerType');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Verify student owns this complaint
  if (complaint.student._id.toString() !== student._id.toString()) {
    throw new AppError('You can only view your own complaints', 403);
  }

  // Fetch complaint history
  const history = await ComplaintHistory.find({ complaint: complaint._id })
    .populate('performedBy', 'name role')
    .sort({ timestamp: 1 })
    .lean();

  const complaintDetail = {
    id: complaint._id,
    complaintId: complaint.complaintId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    categoryOther: complaint.categoryOther,
    placeOfIssue: complaint.placeOfIssue,
    placeOfIssueOther: complaint.placeOfIssueOther,
    workerRequired: complaint.workerRequired,
    priority: complaint.priority,
    status: complaint.status,
    images: complaint.images,
    scholarNumber: complaint.scholarNumber,
    hostel: complaint.hostel,
    block: complaint.block,
    roomNumber: complaint.roomNumber,
    assignedWorker: complaint.assignedWorker,
    adminRemark: complaint.adminRemark,
    slaDeadline: complaint.slaDeadline,
    resolvedAt: complaint.resolvedAt,
    closedAt: complaint.closedAt,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    history: history.map((h) => ({
      action: h.action,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      performedBy: h.performedBy?.name || 'System',
      note: h.note,
      timestamp: h.timestamp,
    })),
  };

  return success(res, 200, 'Complaint retrieved successfully', complaintDetail);
});

// CANCEL COMPLAINT: Student can cancel if status is SUBMITTED or UNDER_REVIEW
// PATCH /api/complaints/:id/cancel
// Requires: authMiddleware + requireStudent
const cancelComplaint = asyncHandler(async (req, res) => {
  const student = req.userDoc;
  const { id } = req.params;

  // Verify student
  if (student.role !== 'student') {
    throw new AppError('Only students can cancel complaints', 403);
  }

  // Find complaint
  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Verify student owns this complaint
  if (complaint.student.toString() !== student._id.toString()) {
    throw new AppError('You can only cancel your own complaints', 403);
  }

  // Verify complaint can be cancelled
  const cancellableStatuses = ['SUBMITTED', 'UNDER_REVIEW'];
  if (!cancellableStatuses.includes(complaint.status)) {
    throw new AppError(
      `Complaint cannot be cancelled in ${complaint.status} status. ` +
        'Only SUBMITTED or UNDER_REVIEW complaints can be cancelled.',
      400
    );
  }

  // Update status to REJECTED (used for student cancellation)
  const oldStatus = complaint.status;
  complaint.status = 'REJECTED';
  complaint.rejectionReason = 'Cancelled by student';
  complaint.closedAt = new Date();
  await complaint.save();

  // Record in history
  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'cancelled',
    fromStatus: oldStatus,
    toStatus: 'REJECTED',
    performedBy: student._id,
    note: 'Student cancelled the complaint',
  });

  return success(res, 200, 'Complaint cancelled successfully', {
    id: complaint._id,
    complaintId: complaint.complaintId,
    status: complaint.status,
  });
});

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintDetail,
  cancelComplaint,
};
