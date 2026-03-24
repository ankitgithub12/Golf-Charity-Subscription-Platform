const express = require('express');
const router = express.Router();
const {
  addScore,
  getScores,
  updateScore,
  deleteScore,
  getScoresByUser,
} = require('../controllers/scoreController');
const { protect, adminOnly, subscribed } = require('../middleware/auth');
const { validate, scoreSchema } = require('../middleware/validate');

// User must be subscribed to enter/view scores
router.post('/', protect, subscribed, validate(scoreSchema), addScore);
router.get('/', protect, subscribed, getScores);
router.put('/:id', protect, subscribed, validate(scoreSchema), updateScore);
router.delete('/:id', protect, deleteScore);

// Admin: view any user's scores
router.get('/user/:userId', protect, adminOnly, getScoresByUser);

module.exports = router;
