const Score = require('../models/Score');

const MAX_SCORES = 5;

/**
 * POST /api/scores
 * Add a new score. If user already has 5, remove the oldest before inserting.
 */
const addScore = async (req, res) => {
  try {
    const { value, datePlayed, notes } = req.body;
    const userId = req.user._id;

    // Stableford range validation
    if (value < 1 || value > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45 (Stableford format)' });
    }

    // Count existing scores
    const count = await Score.countDocuments({ userId });

    if (count >= MAX_SCORES) {
      // Find and delete the oldest score
      const oldest = await Score.findOne({ userId }).sort({ datePlayed: 1 });
      await Score.findByIdAndDelete(oldest._id);
    }

    const score = await Score.create({ userId, value, datePlayed, notes });

    res.status(201).json({ success: true, message: 'Score added', score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/scores
 * Get user's scores in reverse chronological order
 */
const getScores = async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id })
      .sort({ datePlayed: -1 })
      .limit(MAX_SCORES);

    res.json({ success: true, count: scores.length, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/scores/:id
 * Edit an existing score (only owner can edit)
 */
const updateScore = async (req, res) => {
  try {
    const score = await Score.findOne({ _id: req.params.id, userId: req.user._id });
    if (!score)
      return res.status(404).json({ success: false, message: 'Score not found' });

    const { value, datePlayed, notes } = req.body;
    if (value !== undefined) {
      if (value < 1 || value > 45) {
        return res.status(400).json({ success: false, message: 'Score must be between 1 and 45 (Stableford format)' });
      }
      score.value = value;
    }
    if (datePlayed !== undefined) score.datePlayed = datePlayed;
    if (notes !== undefined) score.notes = notes;
    await score.save();

    res.json({ success: true, message: 'Score updated', score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/scores/:id  (admin or owner)
 */
const deleteScore = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, userId: req.user._id };

    const score = await Score.findOneAndDelete(filter);
    if (!score)
      return res.status(404).json({ success: false, message: 'Score not found' });

    res.json({ success: true, message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/scores/user/:userId  — admin: view any user's scores
 */
const getScoresByUser = async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId })
      .sort({ datePlayed: -1 })
      .limit(5);
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addScore, getScores, updateScore, deleteScore, getScoresByUser };
