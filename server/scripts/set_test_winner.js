const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');

async function makeWinner() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'ankit639520@gmail.com' });
    if (!user) {
      console.error('User "ankit639520@gmail.com" Not Found. Please register this user first.');
      process.exit(1);
    }

    let draw = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 });
    if (!draw) {
      console.log('No published draw found. Creating a mock one for testing...');
      draw = await Draw.create({
        month: '2026-03',
        numbers: [7, 14, 21, 28, 35],
        status: 'published',
        publishedAt: new Date(),
        drawType: 'random'
      });
    }

    // Amount in paise (5000 * 100)
    const prizeAmount = 500000;

    const winner = await Winner.create({
      userId: user._id,
      drawId: draw._id,
      matchType: '5-match',
      prizeAmount,
      verificationStatus: 'pending',
      payoutStatus: 'pending'
    });

    await User.findByIdAndUpdate(user._id, { $inc: { totalWinnings: prizeAmount } });

    console.log(`✅ SUCCESS: Ankit kumar is now a winner of ₹${(prizeAmount / 100).toFixed(2)}!`);
    console.log(`Draw: ${draw.month}`);
    console.log(`Winner Record ID: ${winner._id}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

makeWinner();
