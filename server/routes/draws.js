const express = require('express');
const router = express.Router();
const {
  generateDraw,
  simulateDraw,
  publishDraw,
  getDraws,
  getLatestDraw,
  getDrawById,
} = require('../controllers/drawController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate, drawGenerateSchema } = require('../middleware/validate');

// Public
router.get('/latest', getLatestDraw);
router.get('/:id', protect, getDrawById);
router.get('/', protect, getDraws);

// Admin only
router.post('/generate', protect, adminOnly, validate(drawGenerateSchema), generateDraw);
router.post('/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

module.exports = router;
