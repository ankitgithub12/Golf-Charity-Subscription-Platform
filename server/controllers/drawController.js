const crypto = require('crypto');
const Draw = require('../models/Draw');
const PrizePool = require('../models/PrizePool');
const Winner = require('../models/Winner');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { randomDraw, algorithmicDraw, matchSubscribers } = require('../services/drawEngine');
const { calculatePrizePool, buildWinnerAmounts } = require('../services/prizeCalculator');
const sendEmail = require('../utils/sendEmail');

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
        participantCount: subscriberIds.length,
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
        const user = await User.findByIdAndUpdate(userId, { $inc: { totalWinnings: prize } });

        // PRD Requirement: Notify winner via email (Section 13)
        if (prize > 0 && user) {
          try {
            await sendEmail({
              email: user.email,
              subject: `🏆 You Won in the ${draw.month} Golf Draw!`,
              message: `
                <div style="background-color: #020617; padding: 40px 20px; font-family: 'Inter', sans-serif, Arial; color: #f8fafc; text-align: center;">
                  <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                    <div style="background: rgba(245, 158, 11, 0.1); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid rgba(245, 158, 11, 0.2);">🏆</div>
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.025em;">Congratulations, ${user.name}!</h1>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                      You matched <span style="color: #f59e0b; font-weight: 700;">${matchType}</span> in the latest Golf Charity draw!
                    </p>
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Your Prize Winnings:</p>
                      <p style="color: #10b981; font-size: 36px; font-weight: 800; margin: 0;">₹${(prize / 100).toFixed(2)}</p>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px;">
                      Your winnings have been automatically added to your profile. Join the next draw to keep supporting charities and winning big!
                    </p>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.3s ease;">
                       Claim Your Prize
                    </a>
                    <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
                      <p style="color: #64748b; font-size: 13px; margin: 0;">
                        The Golf Charity Winners Circle
                      </p>
                    </div>
                  </div>
                </div>
              `
            });
          } catch (emailErr) {
            console.error(`Failed to notify winner ${userId}:`, emailErr.message);
          }
        }
      }
    };

    await createWinners(results.fiveMatch, '5-match', jackpotRolls ? 0 : perWinner.fiveMatch);
    await createWinners(results.fourMatch, '4-match', perWinner.fourMatch);
    await createWinners(results.threeMatch, '3-match', perWinner.threeMatch);

    // Generate Simulated Blockchain Hash (SHA-256)
    const hashInput = `${draw._id}-${draw.numbers.join(',')}-${Date.now()}`;
    const blockchainHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Update draw document
    draw.results = results;
    draw.status = 'published';
    draw.publishedAt = new Date();
    draw.blockchainHash = blockchainHash;
    draw.jackpotCarriedOver = jackpotRolls;
    draw.carriedOverAmount = jackpotRolls ? pool.fiveMatchPool : 0;
    await draw.save();

    // PRD Requirement: General Draw Results Notification (Section 13)
    // Notify all active subscribers that results are out
    try {
      const allSubscribers = await Subscription.find({ status: 'active' }).populate('userId', 'email name');
      for (const sub of allSubscribers) {
        if (sub.userId) {
          await sendEmail({
            email: sub.userId.email,
            subject: `📢 Draw Results for ${draw.month} are OUT!`,
            message: `
              <div style="background-color: #020617; padding: 40px 20px; font-family: 'Inter', sans-serif, Arial; color: #f8fafc; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
                  <div style="background: rgba(16, 185, 129, 0.1); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid rgba(16, 185, 129, 0.2);">📢</div>
                  <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin-bottom: 16px;">The ${draw.month} Results are LIVE!</h1>
                  <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    Hello ${sub.userId.name}, the winning numbers for this month's draw have been announced.
                  </p>
                  <div style="background: rgba(0, 0, 0, 0.2); border: 1px dotted rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0; text-transform: uppercase;">Winning Numbers</p>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                      ${draw.numbers.map(n => `<span style="display: inline-block; width: 40px; height: 40px; line-height: 40px; background: #10b981; color: white; border-radius: 50%; font-weight: 700; font-size: 18px; margin: 0 4px;">${n}</span>`).join('')}
                    </div>
                  </div>
                  <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px;">
                    Head over to your dashboard to see if your luck came through for the <span style="color: #f59e0b; font-weight: 600;">₹${(pool.totalPool / 100).toFixed(2)}</span> prize pool!
                  </p>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
                     style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.3s ease;">
                     Check My Results
                  </a>
                  <div style="margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                      Good luck for the next one!
                    </p>
                  </div>
                </div>
              </div>
            `
          });
        }
      }
    } catch (notifyErr) {
        console.error('General draw notification failed:', notifyErr.message);
    }

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
    
    // Attach pool data to each draw for subscriberCount/participants
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
