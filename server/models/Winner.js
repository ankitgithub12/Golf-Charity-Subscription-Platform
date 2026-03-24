const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
    },
    // Match tier
    matchType: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
      required: true,
    },
    // How many numbers they actually matched
    matchedNumbers: {
      type: [Number],
      default: [],
    },
    // Prize amount awarded (GBP pence)
    prizeAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    // Cloudinary URL of the uploaded proof screenshot
    proofUrl: {
      type: String,
      default: null,
    },
    proofPublicId: {
      type: String, // Cloudinary public_id for deletion
      default: null,
    },
    // Admin review
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    // Payment tracking
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure one winner record per user per draw
winnerSchema.index({ userId: 1, drawId: 1 }, { unique: true });

module.exports = mongoose.model('Winner', winnerSchema);
