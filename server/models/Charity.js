const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  location: { type: String, default: '' },
});

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    // Cloudinary image URLs
    images: {
      type: [String],
      default: [],
    },
    // Primary image (featured on cards)
    coverImage: {
      type: String,
      default: '',
    },
    // Upcoming golf/charity events
    events: {
      type: [eventSchema],
      default: [],
    },
    // Total donated to this charity (pence)
    totalDonations: {
      type: Number,
      default: 0,
    },
    // Subscriber count supporting this charity
    supporterCount: {
      type: Number,
      default: 0,
    },
    website: {
      type: String,
      default: '',
    },
    // Whether this charity appears as "Featured" on homepage
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Charity categories for filtering
    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'sports', 'community', 'other'],
      default: 'other',
    },
    // Registered charity number (optional)
    registrationNumber: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Text index for search functionality
charitySchema.index({ name: 'text', description: 'text', category: 1 });

module.exports = mongoose.model('Charity', charitySchema);
