// Complaint field validators - reusable across complaint endpoints

const COMPLAINT_CATEGORIES = [
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
];

const COMPLAINT_PLACES = [
  'Room',
  'Bathroom/Toilet',
  'Corridor',
  'Common Area',
  'Mess',
  'Staircase',
  'Hostel Entrance',
  'Other',
];

const WORKER_TYPES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'LAN/Network Technician',
  'Mason',
  'Cleaner',
  'AC/Appliance Technician',
  'Security',
  'Other',
];

const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];

function validateTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length >= 5 && trimmed.length <= 100;
}

function validateDescription(description) {
  if (!description || typeof description !== 'string') return false;
  const trimmed = description.trim();
  return trimmed.length >= 10 && trimmed.length <= 1000;
}

function validateCategory(category) {
  return COMPLAINT_CATEGORIES.includes(category);
}

function validateCategoryOther(categoryOther, category) {
  if (category !== 'Other') return true;
  if (!categoryOther || typeof categoryOther !== 'string') return false;
  return categoryOther.trim().length >= 1 && categoryOther.trim().length <= 100;
}

function validatePlaceOfIssue(place) {
  return COMPLAINT_PLACES.includes(place);
}

function validatePlaceOfIssueOther(placeOther, place) {
  if (place !== 'Other') return true;
  if (!placeOther || typeof placeOther !== 'string') return false;
  return placeOther.trim().length >= 1 && placeOther.trim().length <= 100;
}

function validateWorkerRequired(workerType) {
  return WORKER_TYPES.includes(workerType);
}

function validatePriority(priority) {
  return COMPLAINT_PRIORITIES.includes(priority);
}

function validateImageFile(file) {
  if (!file) return true; // Image is optional
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return false;
  }
  
  // Check file size (max 5MB)
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return false;
  }
  
  return true;
}

function calculateSLADeadline(priority) {
  const now = new Date();
  const offsets = {
    'Emergency': 2 * 60 * 60 * 1000,    // 2 hours
    'High': 6 * 60 * 60 * 1000,         // 6 hours
    'Medium': 24 * 60 * 60 * 1000,      // 24 hours
    'Low': 72 * 60 * 60 * 1000,         // 72 hours
  };
  
  const offset = offsets[priority] || offsets['Medium'];
  return new Date(now.getTime() + offset);
}

function generateComplaintId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HF${timestamp}${random}`;
}

module.exports = {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PLACES,
  WORKER_TYPES,
  COMPLAINT_PRIORITIES,
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
};
