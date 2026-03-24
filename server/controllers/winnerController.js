const Winner = require('../models/Winner');
const cloudinary = require('../config/cloudinary');

/**
 * GET /api/winners/my  — logged-in user's winning records
 */
const getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({ userId: req.user._id })
      .populate('drawId', 'month numbers status publishedAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/winners/:id/upload-proof
 * Upload Cloudinary proof screenshot for a winner record
 */
const uploadProof = async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner record not found' });

    // Only the winner themselves can upload proof
    if (winner.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised' });

    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Delete old proof from Cloudinary if exists
    if (winner.proofPublicId) {
      await cloudinary.uploader.destroy(winner.proofPublicId);
    }

    winner.proofUrl = req.file.path;
    winner.proofPublicId = req.file.filename;
    winner.verificationStatus = 'pending';
    await winner.save();

    res.json({ success: true, message: 'Proof uploaded successfully', winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/winners/:id/verify  [admin]
 * Approve or reject a winner's proof submission
 */
const verifyWinner = async (req, res) => {
  try {
    const { status, adminNote } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        adminNote: adminNote || '',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    res.json({ success: true, message: `Winner ${status}`, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/winners/:id/payout  [admin]
 * Mark payout as paid
 */
const markPayout = async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    if (winner.verificationStatus !== 'approved')
      return res.status(400).json({ success: false, message: 'Winner must be approved first' });

    winner.payoutStatus = 'paid';
    winner.paidAt = new Date();
    await winner.save();

    res.json({ success: true, message: 'Payout marked as paid', winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/winners  [admin] — all winners with filters
 */
const getAllWinners = async (req, res) => {
  try {
    const { verificationStatus, payoutStatus, drawId } = req.query;
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (payoutStatus) filter.payoutStatus = payoutStatus;
    if (drawId) filter.drawId = drawId;

    const winners = await Winner.find(filter)
      .populate('userId', 'name email')
      .populate('drawId', 'month numbers')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: winners.length, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyWinnings, uploadProof, verifyWinner, markPayout, getAllWinners };
