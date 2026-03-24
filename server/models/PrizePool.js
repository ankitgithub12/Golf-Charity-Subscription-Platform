const mongoose = require('mongoose');

const prizePoolSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
      unique: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    // Total active subscribers at draw time
    subscriberCount: {
      type: Number,
      default: 0,
    },
    // Total pool in GBP pence (e.g. 50000 = £500)
    totalPool: {
      type: Number,
      default: 0,
    },
    // Jackpot amount carried in from previous month
    carriedOverAmount: {
      type: Number,
      default: 0,
    },
    // Pool tier breakdown (auto-calculated: 40/35/25)
    fiveMatchPool: {
      type: Number,
      default: 0, // 40% of totalPool + carriedOver
    },
    fourMatchPool: {
      type: Number,
      default: 0, // 35% of totalPool
    },
    threeMatchPool: {
      type: Number,
      default: 0, // 25% of totalPool
    },
    // Per-winner amounts (calculated after result matching)
    fiveMatchWinners: {
      type: Number,
      default: 0,
    },
    fourMatchWinners: {
      type: Number,
      default: 0,
    },
    threeMatchWinners: {
      type: Number,
      default: 0,
    },
    perWinner: {
      fiveMatch: { type: Number, default: 0 },
      fourMatch: { type: Number, default: 0 },
      threeMatch: { type: Number, default: 0 },
    },
    // Subscription fee contribution per user (pence)
    perUserContribution: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PrizePool', prizePoolSchema);
