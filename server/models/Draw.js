const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    // e.g. "2026-03" for March 2026
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
      unique: true,
    },
    // 5 drawn numbers (1–45)
    numbers: {
      type: [Number],
      validate: {
        validator: function (arr) {
          return arr.length === 5 && arr.every((n) => n >= 1 && n <= 45);
        },
        message: 'Draw must contain exactly 5 numbers between 1 and 45',
      },
    },
    drawType: {
      type: String,
      enum: ['random', 'algorithm'],
      default: 'random',
    },
    status: {
      type: String,
      enum: ['draft', 'simulated', 'published'],
      default: 'draft',
    },
    // Published timestamp
    publishedAt: {
      type: Date,
      default: null,
    },
    // Admin who triggered the draw
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Jackpot carried from previous month
    jackpotCarriedOver: {
      type: Boolean,
      default: false,
    },
    // Jackpot amount carried (GBP pence)
    carriedOverAmount: {
      type: Number,
      default: 0,
    },
    // Results: arrays of userId references for each tier
    results: {
      fiveMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      fourMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      threeMatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    // Simulation notes (for pre-publish analysis)
    simulationNotes: {
      type: String,
      default: '',
    },
    blockchainHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);
