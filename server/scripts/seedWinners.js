const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Draw = require('../models/Draw');
const PrizePool = require('../models/PrizePool');
const Winner = require('../models/Winner');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedWinners = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get or create a test user
    let user = await User.findOne({ role: 'user' });
    if (!user) {
      user = await User.create({
        name: 'Test Winner',
        email: `winner_${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        subscriptionStatus: 'active'
      });
      console.log('Created test user:', user.email);
    }

    // 2. Create a published draw for last month
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    let draw = await Draw.findOne({ month });
    
    if (draw) {
        await Draw.deleteOne({ _id: draw._id });
        await PrizePool.deleteOne({ drawId: draw._id });
        await Winner.deleteMany({ drawId: draw._id });
    }

    draw = await Draw.create({
      month,
      numbers: [5, 12, 23, 34, 41],
      drawType: 'random',
      status: 'published',
      publishedAt: new Date(),
      results: {
        fiveMatch: [user._id],
        fourMatch: [],
        threeMatch: []
      }
    });
    console.log('Created published draw for', month);

    // 3. Create Prize Pool
    const pool = await PrizePool.create({
      drawId: draw._id,
      month: draw.month,
      subscriberCount: 1,
      totalPool: 50000, // ₹500
      fiveMatchPool: 20000,
      fourMatchPool: 15000,
      threeMatchPool: 15000,
      fiveMatchWinners: 1,
      perWinner: {
        fiveMatch: 20000,
        fourMatch: 0,
        threeMatch: 0
      }
    });
    console.log('Created prize pool');

    // 4. Create Winner record
    const winner = await Winner.create({
      userId: user._id,
      drawId: draw._id,
      matchType: '5-match',
      prizeAmount: 20000,
      verificationStatus: 'pending',
      payoutStatus: 'pending'
    });
    console.log('✅ Created winner record for', user.name);

    // 5. Update user total winnings
    await User.findByIdAndUpdate(user._id, { $inc: { totalWinnings: 20000 } });

    console.log('\nSeed successful! Refresh your Admin Dashboard to see the winner.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedWinners();
