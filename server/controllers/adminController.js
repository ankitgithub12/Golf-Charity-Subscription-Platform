const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const PrizePool = require('../models/PrizePool');
const Winner = require('../models/Winner');
const Score = require('../models/Score');

/**
 * GET /api/admin/users  — paginated user list
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const filter = search
      ? { role: 'user', $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : { role: 'user' };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/users/:id  — single user with scores & subscription
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('selectedCharity', 'name coverImage');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const subscription = await Subscription.findOne({ userId: user._id }).sort({ createdAt: -1 });
    const scores = await Score.find({ userId: user._id }).sort({ datePlayed: -1 }).limit(5);

    res.json({ success: true, user, subscription, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/users/:id  — edit user (admin override)
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, subscriptionStatus } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (role) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;
    if (subscriptionStatus) update.subscriptionStatus = subscriptionStatus;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/analytics  — dashboard stats
 */
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      totalCharities,
      totalDraws,
      pendingVerifications,
      pendingPayouts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ subscriptionStatus: 'active' }),
      Charity.countDocuments({ isActive: true }),
      Draw.countDocuments({ status: 'published' }),
      Winner.countDocuments({ verificationStatus: 'pending' }),
      Winner.countDocuments({ verificationStatus: 'approved', payoutStatus: 'pending' }),
    ]);

    // Total prize pools paid out (historical)
    const poolAgg = await PrizePool.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPool' } } },
    ]);
    const totalPrizePaid = poolAgg[0]?.total || 0;

    // Projected Pool for current month (Real-time estimate)
    // Formula: (activeSubscribers * (499 * 0.30)) based on 30% contribution rate
    // Note: Assuming average price for projection
    const POOL_CONTRIBUTION_RATE = 0.30;
    const AVG_SUB_PRICE = 49900; // 499 INR in paise
    const projectedPool = activeSubscribers * Math.floor(AVG_SUB_PRICE * POOL_CONTRIBUTION_RATE);

    // Total charity donations (sum of totalDonations field in Charity models)
    const charityAgg = await Charity.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDonations' } } },
    ]);
    const totalDonations = charityAgg[0]?.total || 0;

    // Monthly growth: new users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Recent draws
    const recentDraws = await Draw.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3);

    res.json({
      success: true,
      analytics: {
        userCount: totalUsers,
        activeSubs: activeSubscribers,
        totalCharities,
        totalDraws,
        pendingVerifications,
        pendingPayouts,
        totalPrize: totalPrizePaid,
        projectedPool: projectedPool,
        charityPot: totalDonations,
        newUsersThisMonth,
        recentDraws,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/scores/:id  — edit any user's score
 */
const editScore = async (req, res) => {
  try {
    const { value, datePlayed, notes } = req.body;
    if (value !== undefined && (value < 1 || value > 45)) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }
    const score = await Score.findByIdAndUpdate(
      req.params.id,
      { ...(value !== undefined && { value }), ...(datePlayed && { datePlayed }), ...(notes !== undefined && { notes }) },
      { new: true, runValidators: true }
    );
    if (!score) return res.status(404).json({ success: false, message: 'Score not found' });
    res.json({ success: true, message: 'Score updated', score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/scores/:id  — delete any user's score
 */
const deleteScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) return res.status(404).json({ success: false, message: 'Score not found' });
    res.json({ success: true, message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/winners — get all winner claims
 */
const getWinners = async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate('userId', 'name email bankDetails')
      .populate('drawId', 'month year status')
      .sort({ createdAt: -1 });
    res.json({ success: true, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/winners/:id/payout — update winner payout status
 */
const updateWinnerPayout = async (req, res) => {
  try {
    const { payoutStatus, verificationStatus, adminNote } = req.body;
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    if (payoutStatus) {
      winner.payoutStatus = payoutStatus;
      if (payoutStatus === 'paid') winner.paidAt = new Date();
    }
    if (verificationStatus) {
      winner.verificationStatus = verificationStatus;
      winner.verifiedBy = req.user._id;
      winner.verifiedAt = new Date();
    }
    if (adminNote !== undefined) winner.adminNote = adminNote;

    await winner.save();
    res.json({ success: true, message: 'Winner payout updated', winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  getUsers, 
  getUserById, 
  updateUser, 
  getAnalytics, 
  editScore, 
  deleteScore,
  getWinners,
  updateWinnerPayout
};
