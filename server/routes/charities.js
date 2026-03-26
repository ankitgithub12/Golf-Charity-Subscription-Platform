const express = require('express');
const router = express.Router();
const {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  selectCharity,
  donate,
  addEvent,
  removeEvent,
} = require('../controllers/charityController');
const { protect, adminOnly, subscribed } = require('../middleware/auth');
const { uploadCharityImage } = require('../middleware/upload');
const { validate, charitySchema, charitySelectSchema } = require('../middleware/validate');

// Public
router.get('/', getCharities);
router.get('/:id', getCharityById);

// User — select a charity (must be subscribed)
router.post('/select', protect, subscribed, validate(charitySelectSchema), selectCharity);

// User — independent donation (must be logged in)
router.post('/:id/donate', protect, donate);

// Admin CRUD
router.post('/', protect, adminOnly, uploadCharityImage.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), validate(charitySchema), createCharity);
router.put('/:id', protect, adminOnly, uploadCharityImage.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

// Admin — events management
router.post('/:id/events', protect, adminOnly, addEvent);
router.delete('/:id/events/:eventId', protect, adminOnly, removeEvent);

module.exports = router;
