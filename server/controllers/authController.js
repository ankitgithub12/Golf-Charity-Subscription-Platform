const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper — sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // logic for admin registration via secret code
    let role = 'user';
    if (adminSecret && adminSecret === process.env.ADMIN_REGISTRATION_SECRET) {
      role = 'admin';
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'admin' ? 'Admin account created successfully' : 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = signToken(user._id);

    // Re-fetch with populate so selectedCharity is an object, not a raw ObjectId
    const populatedUser = await User.findById(user._id).populate('selectedCharity', 'name coverImage');

    res.json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name coverImage');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/auth/profile  — update name / profile image
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name) update.name = name;
    if (req.file) update.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).populate('selectedCharity', 'name coverImage');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
