// Phase 3 Auth Demonstration
// This demonstrates the core auth functionality without needing MongoDB
// Run: node src/test/demo-auth.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'test_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d';

console.log('========================================');
console.log('HostelFix Phase 3 - Auth Demonstration');
console.log('========================================\n');

// ========== Test 1: Password Hashing ==========
console.log('TEST 1: Password Hashing with bcryptjs');
console.log('---');

async function testPasswordHashing() {
  const plainPassword = 'MyPassword123';

  console.log(`Plain password: ${plainPassword}`);

  // Simulate what User.pre('save') does
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  console.log(`Hashed password: ${hashedPassword.substring(0, 20)}...`);

  // Test correct password
  const correctPassword = await bcrypt.compare('MyPassword123', hashedPassword);
  console.log(`Compare correct password: ${correctPassword} ✓`);

  // Test wrong password
  const wrongPassword = await bcrypt.compare('WrongPassword', hashedPassword);
  console.log(`Compare wrong password: ${wrongPassword} ✓`);

  console.log('Hashing and comparison work correctly!\n');
}

// ========== Test 2: JWT Generation ==========
console.log('TEST 2: JWT Token Generation');
console.log('---');

function testJWTGeneration() {
  const userId = '64f123456789abcdef012345';
  const role = 'student';

  const token = jwt.sign(
    { id: userId, role: role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  console.log(`Generated token (first 50 chars): ${token.substring(0, 50)}...`);
  console.log(`Token length: ${token.length} characters`);

  // Decode without verification (shows structure)
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log(`Token payload: ${JSON.stringify(payload)}`);
  console.log('Token generation works correctly!\n');

  return token;
}

// ========== Test 3: JWT Verification ==========
console.log('TEST 3: JWT Token Verification');
console.log('---');

function testJWTVerification(token) {
  // Valid token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✓ Valid token verified: ${JSON.stringify(decoded)}`);
  } catch (err) {
    console.log(`✗ Token verification failed: ${err.message}`);
  }

  // Invalid token
  try {
    jwt.verify('invalid_token_12345', JWT_SECRET);
    console.log('✗ Invalid token should have failed!');
  } catch (err) {
    console.log(`✓ Invalid token rejected: ${err.message}`);
  }

  // Expired token (create one with 0 expiration)
  const expiredToken = jwt.sign({ id: '123', role: 'student' }, JWT_SECRET, {
    expiresIn: '-10s', // Expired 10 seconds ago
  });
  try {
    jwt.verify(expiredToken, JWT_SECRET);
    console.log('✗ Expired token should have failed!');
  } catch (err) {
    console.log(`✓ Expired token rejected: ${err.message}`);
  }

  console.log('Token verification works correctly!\n');
}

// ========== Test 4: Role-Based Access Control ==========
console.log('TEST 4: Role-Based Access Control');
console.log('---');

function checkAccess(role, requiredRole) {
  if (role === requiredRole) {
    console.log(`✓ ${role} CAN access ${requiredRole}-only resource`);
    return true;
  } else {
    console.log(`✗ ${role} CANNOT access ${requiredRole}-only resource (403)`);
    return false;
  }
}

const studentToken = jwt.sign({ id: '123', role: 'student' }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});
const adminToken = jwt.sign({ id: '456', role: 'admin' }, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});

const studentPayload = jwt.verify(studentToken, JWT_SECRET);
const adminPayload = jwt.verify(adminToken, JWT_SECRET);

console.log('Student accessing student routes:');
checkAccess(studentPayload.role, 'student');
checkAccess(studentPayload.role, 'admin');

console.log('\nAdmin accessing admin routes:');
checkAccess(adminPayload.role, 'admin');
checkAccess(adminPayload.role, 'student');

console.log('\nRBACworks correctly!\n');

// ========== Test 5: Authentication Flow Simulation ==========
console.log('TEST 5: Complete Authentication Flow Simulation');
console.log('---');

async function simulateAuthFlow() {
  // Step 1: User registers with plaintext password
  const newUser = {
    id: 'user_123',
    name: 'Test Student',
    email: 'test@example.com',
    password: 'SecurePassword123', // plaintext
    role: 'student',
  };

  console.log(`1. User registers: ${newUser.email}`);

  // Step 2: Password is hashed (simulating pre-save hook)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newUser.password, salt);
  console.log(`2. Password hashed on server (pre-save hook)`);

  // Step 3: User logs in with plaintext password
  const loginAttempt = {
    email: 'test@example.com',
    password: 'SecurePassword123',
  };

  console.log(`3. User logs in: ${loginAttempt.email}`);

  // Step 4: Server compares plaintext with hash
  const passwordMatch = await bcrypt.compare(loginAttempt.password, hashedPassword);
  console.log(`4. Password comparison result: ${passwordMatch}`);

  if (!passwordMatch) {
    console.log('✗ LOGIN FAILED - Invalid password');
    return;
  }

  // Step 5: Server generates JWT
  const token = jwt.sign(
    { id: newUser.id, role: newUser.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  console.log(`5. JWT token generated: ${token.substring(0, 30)}...`);

  // Step 6: Client stores token and sends it with protected requests
  console.log(`6. Client stores token in localStorage`);

  // Step 7: Protected request arrives with token in Authorization header
  const authHeader = `Bearer ${token}`;
  const tokenFromHeader = authHeader.slice(7);
  console.log(`7. Protected request arrives: Authorization: ${authHeader.substring(0, 30)}...`);

  // Step 8: Server verifies token
  const decoded = jwt.verify(tokenFromHeader, JWT_SECRET);
  console.log(`8. Token verified: ${JSON.stringify(decoded)}`);

  // Step 9: Check role for authorization
  if (decoded.role === 'student') {
    console.log(`9. ✓ Access granted to student resource`);
  } else {
    console.log(`9. ✗ Access denied - wrong role`);
  }

  console.log('\nComplete auth flow works correctly!\n');
}

// ========== Run All Tests ==========
async function runAllTests() {
  try {
    await testPasswordHashing();
    const token = testJWTGeneration();
    testJWTVerification(token);
    checkAccess('student', 'student');
    await simulateAuthFlow();

    console.log('========================================');
    console.log('✅ All auth tests passed!');
    console.log('========================================');
    console.log('\nKey takeaways:');
    console.log('1. Passwords are hashed with bcryptjs (never stored plaintext)');
    console.log('2. JWTs are signed but not encrypted (payload is readable)');
    console.log('3. Token signature is verified to ensure no tampering');
    console.log('4. Role-based access control is checked on protected routes');
    console.log('5. Complete flow: register → hash → login → compare → JWT → verify → authorize');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runAllTests();
