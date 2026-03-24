/**
 * Prize Calculator Service
 * Handles 40 / 35 / 25 pool distribution and per-winner splits
 */

// Subscription prices in INR paise (sourced from .env)
const PLAN_PRICES = {
  monthly: parseInt(process.env.MONTHLY_PRICE_PAISE) || 49900,  
  yearly: parseInt(process.env.YEARLY_PRICE_PAISE) || 499900,  
};

// Prize pool contribution: portion of each subscription going to prize pool
const POOL_CONTRIBUTION_RATE = 0.30; // 30% of subscription fee goes to prize pool

// Split percentages (must sum to 100)
const POOL_SPLIT = {
  fiveMatch: 0.40,
  fourMatch: 0.35,
  threeMatch: 0.25,
};

/**
 * Calculate total prize pool from active subscribers
 * @param {number} subscriberCount
 * @param {{ monthly: number, yearly: number }} planCounts - count by plan type
 * @param {number} carriedOverAmount - jackpot from previous month (pence)
 * @returns {{ totalPool, perUserContribution, fiveMatchPool, fourMatchPool, threeMatchPool }}
 */
const calculatePrizePool = (planCounts = {}, carriedOverAmount = 0) => {
  const { monthly = 0, yearly = 0 } = planCounts;

  // Monthly contribution per user per month
  const monthlyContrib = Math.floor(PLAN_PRICES.monthly * POOL_CONTRIBUTION_RATE);
  // Yearly users contribute 1/12 per month
  const yearlyContrib = Math.floor((PLAN_PRICES.yearly / 12) * POOL_CONTRIBUTION_RATE);

  const basePool = monthly * monthlyContrib + yearly * yearlyContrib;

  // 1. Calculate the current month's splits from the new contributions (basePool)
  const fiveMatchBaseShare = Math.floor(basePool * POOL_SPLIT.fiveMatch);
  const fourMatchPool = Math.floor(basePool * POOL_SPLIT.fourMatch);
  const threeMatchPool = Math.floor(basePool * POOL_SPLIT.threeMatch);

  // 2. Add the carried over jackpot EXCLUSIVELY to the 5-match tier
  const fiveMatchPool = fiveMatchBaseShare + carriedOverAmount;

  // 3. Recalculate actual total pool
  const actualTotalPool = fiveMatchPool + fourMatchPool + threeMatchPool;

  return {
    totalPool: actualTotalPool, // Total available across all tiers
    basePool,                  // New money this month
    carriedOverAmount,         // From previous month
    perUserContribution: monthlyContrib, // approximate (monthly rate)
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool
  };
};

/**
 * Calculate per-winner share given pool amount and winner count
 * @param {number} poolAmount - pence
 * @param {number} winnerCount
 * @returns {number} pence per winner (floored to avoid fractions)
 */
const splitAmongWinners = (poolAmount, winnerCount) => {
  if (winnerCount === 0) return 0;
  return Math.floor(poolAmount / winnerCount);
};

/**
 * Build the full per-winner breakdown for a draw
 * @param {{ fiveMatchPool, fourMatchPool, threeMatchPool }} pool
 * @param {{ fiveMatch: string[], fourMatch: string[], threeMatch: string[] }} results
 * @returns {{ perWinner: { fiveMatch, fourMatch, threeMatch }, jackpotRolls: boolean }}
 */
const buildWinnerAmounts = (pool, results) => {
  const jackpotRolls = results.fiveMatch.length === 0;

  return {
    perWinner: {
      fiveMatch: jackpotRolls
        ? 0
        : splitAmongWinners(pool.fiveMatchPool, results.fiveMatch.length),
      fourMatch: splitAmongWinners(pool.fourMatchPool, results.fourMatch.length),
      threeMatch: splitAmongWinners(pool.threeMatchPool, results.threeMatch.length),
    },
    jackpotRolls,
  };
};

module.exports = { calculatePrizePool, splitAmongWinners, buildWinnerAmounts, PLAN_PRICES };
