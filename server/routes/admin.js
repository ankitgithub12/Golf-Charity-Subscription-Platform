const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  getAnalytics, 
  editScore, 
  deleteScore,
  getWinners,
  updateWinnerPayout
} = require('../controllers/adminController');
const { getScoresByUser } = require('../controllers/scoreController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/winners', getWinners);
router.put('/winners/:id/payout', updateWinnerPayout);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.get('/users/:userId/scores', getScoresByUser);
router.put('/scores/:id', editScore);
router.delete('/scores/:id', deleteScore);

module.exports = router;
