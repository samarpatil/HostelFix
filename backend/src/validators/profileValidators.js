// Validation functions for student profile fields
// These are reusable across controllers

function validateEmail(email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
}

function validateScholarNumber(scholarNumber) {
  if (!scholarNumber || typeof scholarNumber !== 'string') return false;
  if (scholarNumber.trim().length === 0) return false;
  return scholarNumber.trim().length <= 50;
}

function validateRoomNumber(roomNumber) {
  if (!roomNumber || typeof roomNumber !== 'string') return false;
  if (roomNumber.trim().length === 0) return false;
  return roomNumber.trim().length <= 20;
}

function validateHostel(hostel) {
  if (!hostel || typeof hostel !== 'string') return false;
  if (hostel.trim().length === 0) return false;
  return hostel.trim().length <= 50;
}

function validateBlock(block) {
  if (!block || typeof block !== 'string') return false;
  if (block.trim().length === 0) return false;
  return block.trim().length <= 50;
}

function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.trim().length < 2) return false;
  return name.trim().length <= 100;
}

module.exports = {
  validateEmail,
  validatePhone,
  validateScholarNumber,
  validateRoomNumber,
  validateHostel,
  validateBlock,
  validateName,
};
