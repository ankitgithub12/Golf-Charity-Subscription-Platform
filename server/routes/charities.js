const express = require('express');
const router = express.Router();
const {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  selectCharity,
} = require('../controllers/charityController');
const { protect, adminOnly, subscribed } = require('../middleware/auth');
const { uploadCharityImage } = require('../middleware/upload');
const { validate, charitySchema, charitySelectSchema } = require('../middleware/validate');

// Public
router.get('/', getCharities);
router.get('/:id', getCharityById);

// User — select a charity (must be subscribed)
router.post('/select', protect, subscribed, validate(charitySelectSchema), selectCharity);

// Admin CRUD
router.post('/', protect, adminOnly, uploadCharityImage.single('coverImage'), validate(charitySchema), createCharity);
router.put('/:id', protect, adminOnly, uploadCharityImage.single('coverImage'), updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;
