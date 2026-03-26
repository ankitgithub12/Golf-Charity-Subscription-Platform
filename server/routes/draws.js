const express = require('express');
const router = express.Router();
const {
  generateDraw,
  simulateDraw,
  publishDraw,
  getDraws,
  getLatestDraw,
  getDrawById,
  getPublishedDraws,
} = require('../controllers/drawController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate, drawGenerateSchema } = require('../middleware/validate');

// Public (no auth required)
router.get('/public', getPublishedDraws);
router.get('/latest', getLatestDraw);
router.get('/:id', protect, getDrawById);
router.get('/', protect, getDraws);

// Admin only
router.post('/generate', protect, adminOnly, validate(drawGenerateSchema), generateDraw);
router.post('/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

module.exports = router;
