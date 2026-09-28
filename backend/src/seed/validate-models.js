// This script validates all models without connecting to MongoDB.
// Useful for CI/CD and development to catch schema definition errors early.

const mongoose = require('mongoose');
const { User, Complaint, Worker, Notification, Feedback, ComplaintHistory } = require('../models');

console.log('========================================');
console.log('HostelFix Model Validation');
console.log('========================================\n');

function validateModel(ModelClass, name) {
  try {
    const schema = ModelClass.schema;
    const paths = schema.paths;

    console.log(`\n✓ ${name}`);
    console.log(`  Fields: ${Object.keys(paths).length}`);
    console.log(`  Indexes: ${schema._indexes ? schema._indexes.length : 0}`);

    // List key fields
    const keyFields = Object.keys(paths).slice(0, 5);
    console.log(`  Sample fields: ${keyFields.join(', ')}`);

    return true;
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    return false;
  }
}

const models = [
  { Class: User, name: 'User' },
  { Class: Complaint, name: 'Complaint' },
  { Class: Worker, name: 'Worker' },
  { Class: Notification, name: 'Notification' },
  { Class: Feedback, name: 'Feedback' },
  { Class: ComplaintHistory, name: 'ComplaintHistory' },
];

let allValid = true;
models.forEach(({ Class, name }) => {
  if (!validateModel(Class, name)) {
    allValid = false;
  }
});

console.log('\n========================================');
if (allValid) {
  console.log('✅ All models validated successfully!');
  console.log('========================================');
  process.exit(0);
} else {
  console.log('❌ Some models failed validation');
  console.log('========================================');
  process.exit(1);
}
