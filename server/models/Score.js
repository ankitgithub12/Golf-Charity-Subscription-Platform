const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Stableford score: 1–45
    value: {
      type: Number,
      required: [true, 'Score value is required'],
      min: [1, 'Score must be at least 1'],
      max: [45, 'Score cannot exceed 45 (Stableford format)'],
    },
    // Date the round was played
    datePlayed: {
      type: Date,
      required: [true, 'Date played is required'],
    },
    // Optional notes
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for efficient per-user score queries (sorted by date)
scoreSchema.index({ userId: 1, datePlayed: -1 });

module.exports = mongoose.model('Score', scoreSchema);
