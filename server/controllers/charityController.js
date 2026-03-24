const Charity = require('../models/Charity');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

/**
 * GET /api/charities  — public listing with search & filter
 */
const getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = { isActive: true };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const charities = await Charity.find(filter).sort({ featured: -1, supporterCount: -1 });
    res.json({ success: true, count: charities.length, charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/charities/:id  — single charity detail
 */
const getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity || !charity.isActive)
      return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/charities  [admin] — create charity
 */
const createCharity = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle uploaded cover image
    if (req.file) {
      data.coverImage = req.file.path;
      data.images = [req.file.path];
    }

    const charity = await Charity.create(data);
    res.status(201).json({ success: true, message: 'Charity created', charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/charities/:id  [admin] — update charity
 */
const updateCharity = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.coverImage = req.file.path;
    }

    const charity = await Charity.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });

    res.json({ success: true, message: 'Charity updated', charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/charities/:id  [admin] — soft delete
 */
const deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, message: 'Charity removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/charities/select  [user] — select charity & set contribution %
 */
const selectCharity = async (req, res) => {
  try {
    const { charityId, charityContributionPct } = req.body;

    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive)
      return res.status(404).json({ success: false, message: 'Charity not found' });

    // Decrement supporter count on old charity
    if (req.user.selectedCharity && req.user.selectedCharity.toString() !== charityId) {
      await Charity.findByIdAndUpdate(req.user.selectedCharity, { $inc: { supporterCount: -1 } });
    }

    // Update user
    const updateData = { selectedCharity: charityId };
    if (charityContributionPct) updateData.charityContributionPct = charityContributionPct;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).populate(
      'selectedCharity',
      'name coverImage'
    );

    // Increment new charity supporter count
    await Charity.findByIdAndUpdate(charityId, { $inc: { supporterCount: 1 } });

    res.json({ success: true, message: 'Charity selection updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCharities, getCharityById, createCharity, updateCharity, deleteCharity, selectCharity };
