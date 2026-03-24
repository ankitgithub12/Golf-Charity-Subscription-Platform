const express = require('express');
const router = express.Router();
const {
  getMyWinnings,
  uploadProof,
  verifyWinner,
  markPayout,
  getAllWinners,
} = require('../controllers/winnerController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProof: uploadProofMiddleware } = require('../middleware/upload');

// User
router.get('/my', protect, getMyWinnings);
router.post('/:id/upload-proof', protect, uploadProofMiddleware.single('proof'), uploadProof);

// Admin
router.get('/', protect, adminOnly, getAllWinners);
router.put('/:id/verify', protect, adminOnly, verifyWinner);
router.put('/:id/payout', protect, adminOnly, markPayout);

module.exports = router;
