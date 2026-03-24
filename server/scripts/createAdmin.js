const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin User';

  if (!email || !password) {
    console.log('Usage: node scripts/createAdmin.js <email> <password> [name]');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ User ${email} promoted to admin`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
        isEmailVerified: true
      });
      console.log(`✅ Admin account created for ${email}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
