const Draw = require('../models/Draw');
const PrizePool = require('../models/PrizePool');
const Winner = require('../models/Winner');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { randomDraw, algorithmicDraw, matchSubscribers } = require('../services/drawEngine');
const { calculatePrizePool, buildWinnerAmounts } = require('../services/prizeCalculator');

/**
 * POST /api/draws/generate  [admin]
 * Generate a new draw (random or algorithmic). Status = draft.
 */
const generateDraw = async (req, res) => {
  try {
    const { month, drawType = 'random' } = req.body;

    // Prevent duplicate draws for the same month
    const existing = await Draw.findOne({ month });
    if (existing)
      return res.status(400).json({ success: false, message: `Draw for ${month} already exists` });

    const numbers =
      drawType === 'algorithm' ? await algorithmicDraw() : randomDraw();

    const draw = await Draw.create({
      month,
      numbers,
      drawType,
      status: 'draft',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Draw generated', draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/draws/simulate  [admin]
 * Runs matching and prize calc without saving winner records. Status = simulated.
 */
const simulateDraw = async (req, res) => {
  try {
    const { drawId } = req.body;
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published')
      return res.status(400).json({ success: false, message: 'Draw already published' });

    // Get all active subscriber IDs
    const activeSubs = await Subscription.find({ status: 'active' }).select('userId');
    const subscriberIds = activeSubs.map((s) => s.userId.toString());

    // Match subscribers
    const results = await matchSubscribers(draw.numbers, subscriberIds);

    // Get plan count breakdown for prize pool
    const monthlySubs = await Subscription.countDocuments({ status: 'active', planType: 'monthly' });
    const yearlySubs = await Subscription.countDocuments({ status: 'active', planType: 'yearly' });

    // Check previous jackpot rollover
    const prevDraw = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 });
    const prevPool = prevDraw ? await PrizePool.findOne({ drawId: prevDraw._id }) : null;
    const carriedOver = prevDraw?.jackpotCarriedOver ? (prevPool?.fiveMatchPool || 0) : 0;

    const pool = calculatePrizePool({ monthly: monthlySubs, yearly: yearlySubs }, carriedOver);
    const { perWinner, jackpotRolls } = buildWinnerAmounts(pool, results);

    // Update draw status to simulated
    draw.results = results;
    draw.status = 'simulated';
    draw.simulationNotes = `Simulated: ${subscriberIds.length} subscribers checked. Jackpot rolls: ${jackpotRolls}`;
    await draw.save();

    res.json({
      success: true,
      message: 'Simulation complete',
      simulation: {
        drawnNumbers: draw.numbers,
        subscribersChecked: subscriberIds.length,
        tier5Count: results.fiveMatch.length,
        tier4Count: results.fourMatch.length,
        tier3Count: results.threeMatch.length,
        totalPool: pool.totalPool,
        perWinner,
        jackpotRolls,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/draws/:id/publish  [admin]
 * Publishes the draw, creates Winner records, calculates prize pool, handles jackpot rollover.
 */
const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published')
      return res.status(400).json({ success: false, message: 'Draw already published' });

    // Get active subscribers
    const activeSubs = await Subscription.find({ status: 'active' }).select('userId planType');
    const subscriberIds = activeSubs.map((s) => s.userId.toString());

    // Match all subscribers
    const results = await matchSubscribers(draw.numbers, subscriberIds);

    // Plan counts
    const monthlySubs = activeSubs.filter((s) => s.planType === 'monthly').length;
    const yearlySubs = activeSubs.filter((s) => s.planType === 'yearly').length;

    // Previous jackpot rollover check
    const prevPublished = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 });
    const prevPool = prevPublished ? await PrizePool.findOne({ drawId: prevPublished._id }) : null;
    const carriedOver =
      prevPublished?.jackpotCarriedOver && prevPool ? prevPool.fiveMatchPool : 0;

    const pool = calculatePrizePool({ monthly: monthlySubs, yearly: yearlySubs }, carriedOver);
    const { perWinner, jackpotRolls } = buildWinnerAmounts(pool, results);

    // Save prize pool record
    await PrizePool.create({
      drawId: draw._id,
      month: draw.month,
      subscriberCount: subscriberIds.length,
      totalPool: pool.totalPool,
      carriedOverAmount: carriedOver,
      fiveMatchPool: pool.fiveMatchPool,
      fourMatchPool: pool.fourMatchPool,
      threeMatchPool: pool.threeMatchPool,
      fiveMatchWinners: results.fiveMatch.length,
      fourMatchWinners: results.fourMatch.length,
      threeMatchWinners: results.threeMatch.length,
      perWinner,
    });

    // Create Winner records
    const createWinners = async (userIds, matchType, prize) => {
      for (const userId of userIds) {
        await Winner.findOneAndUpdate(
          { userId, drawId: draw._id },
          { userId, drawId: draw._id, matchType, prizeAmount: prize },
          { upsert: true, new: true }
        );
        // Add prize to user's total winnings
        await User.findByIdAndUpdate(userId, { $inc: { totalWinnings: prize } });
      }
    };

    await createWinners(results.fiveMatch, '5-match', jackpotRolls ? 0 : perWinner.fiveMatch);
    await createWinners(results.fourMatch, '4-match', perWinner.fourMatch);
    await createWinners(results.threeMatch, '3-match', perWinner.threeMatch);

    // Update draw document
    draw.results = results;
    draw.status = 'published';
    draw.publishedAt = new Date();
    draw.jackpotCarriedOver = jackpotRolls;
    draw.carriedOverAmount = jackpotRolls ? pool.fiveMatchPool : 0;
    await draw.save();

    res.json({
      success: true,
      message: `Draw published for ${draw.month}`,
      draw,
      pool,
      perWinner,
      jackpotRolls,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/draws  — list all draws (admin gets all, users get published only)
 */
const getDraws = async (req, res) => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { status: 'published' };
    const draws = await Draw.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/draws/latest — most recent published draw with pool data
 */
const getLatestDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' }).sort({ publishedAt: -1 });
    if (!draw) return res.json({ success: true, draw: null });

    const pool = await PrizePool.findOne({ drawId: draw._id });
    res.json({ success: true, draw, pool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/draws/:id — single draw detail
 */
const getDrawById = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id).populate('createdBy', 'name');
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    const pool = await PrizePool.findOne({ drawId: draw._id });
    res.json({ success: true, draw, pool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/draws/public — public list of published draws, no auth required
 */
const getPublishedDraws = async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' }).sort({ createdAt: -1 });
    // Attach pool data to each draw
    const drawsWithPool = await Promise.all(
      draws.map(async (d) => {
        const pool = await PrizePool.findOne({ drawId: d._id });
        return { ...d.toObject(), pool };
      })
    );
    res.json({ success: true, draws: drawsWithPool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateDraw, simulateDraw, publishDraw, getDraws, getLatestDraw, getDrawById, getPublishedDraws };
