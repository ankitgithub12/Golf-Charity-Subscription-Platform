const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, getAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

module.exports = router;
