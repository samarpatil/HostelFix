require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { User, Complaint, Worker, Notification, ComplaintHistory } = require('../models');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (WARNING: destructive!)
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Worker.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await ComplaintHistory.deleteMany({});

    // Create sample admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hostelfix.local',
      password: 'admin123', // Phase 3 will hash this
      role: 'admin',
    });
    console.log('✓ Admin created:', admin.email);

    // Create sample students
    const student1 = await User.create({
      name: 'Raj Kumar',
      email: 'raj.kumar@manit.ac.in',
      password: 'student123',
      role: 'student',
      scholarNumber: 'MN/2024/001',
      phone: '9876543210',
      hostel: 'Hostel A',
      block: 'Block 1',
      roomNumber: '101',
    });
    console.log('✓ Student 1 created:', student1.email);

    const student2 = await User.create({
      name: 'Priya Singh',
      email: 'priya.singh@manit.ac.in',
      password: 'student123',
      role: 'student',
      scholarNumber: 'MN/2024/002',
      phone: '9123456789',
      hostel: 'Hostel B',
      block: 'Block 2',
      roomNumber: '205',
    });
    console.log('✓ Student 2 created:', student2.email);

    // Create sample workers
    const plumber = await Worker.create({
      name: 'Ramesh Plumber',
      workerId: 'WRK001',
      phone: '9988776655',
      workerType: 'Plumber',
      isActive: true,
    });
    console.log('✓ Plumber worker created:', plumber.name);

    const electrician = await Worker.create({
      name: 'Suresh Electrician',
      workerId: 'WRK002',
      phone: '9888776655',
      workerType: 'Electrician',
      isActive: true,
    });
    console.log('✓ Electrician worker created:', electrician.name);

    // Create sample complaint
    const slaDeadlineHigh = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours for High priority

    const complaint1 = await Complaint.create({
      complaintId: 'HF10001',
      student: student1._id,
      scholarNumber: student1.scholarNumber,
      hostel: student1.hostel,
      block: student1.block,
      roomNumber: student1.roomNumber,
      placeOfIssue: 'Bathroom/Toilet',
      category: 'Plumbing',
      workerRequired: 'Plumber',
      title: 'Tap is leaking',
      description: 'The tap in the bathroom has been leaking for 2 days. Water is dripping constantly.',
      priority: 'High',
      status: 'SUBMITTED',
      slaDeadline: slaDeadlineHigh,
    });
    console.log('✓ Complaint 1 created:', complaint1.complaintId);

    // Create a complaint history entry
    await ComplaintHistory.create({
      complaint: complaint1._id,
      action: 'submitted',
      toStatus: 'SUBMITTED',
      performedBy: student1._id,
      note: 'Student submitted complaint via web',
      timestamp: new Date(),
    });
    console.log('✓ Complaint history entry created');

    // Create sample notification
    const notification = await Notification.create({
      recipient: admin._id,
      recipientRole: 'admin',
      type: 'complaint_submitted',
      message: `New complaint #${complaint1.complaintId} from ${student1.name}: ${complaint1.title}`,
      relatedComplaint: complaint1._id,
      isRead: false,
    });
    console.log('✓ Notification created for admin');

    console.log('\n✅ Seeding complete!');
    console.log('\nSample login credentials:');
    console.log('Admin:   admin@hostelfix.local / admin123');
    console.log('Student: raj.kumar@manit.ac.in / student123');
    console.log('Student: priya.singh@manit.ac.in / student123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
