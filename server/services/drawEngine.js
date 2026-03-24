const Score = require('../models/Score');

/**
 * Draw Engine Service
 * Supports two modes:
 *   - random: standard lottery random number generation
 *   - algorithm: weighted by frequency of user scores (most common scores appear more)
 */

/**
 * Generate 5 unique random numbers between 1–45
 * @returns {number[]}
 */
const randomDraw = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Algorithmic draw — builds a weighted pool from all active user scores
 * Numbers that appear more frequently in user scores have a higher weight.
 * @returns {Promise<number[]>}
 */
const algorithmicDraw = async () => {
  // Aggregate all score values from the database
  const scoreDocs = await Score.find({}, 'value');
  const frequency = {};

  // Count occurrences of each score value (1–45)
  scoreDocs.forEach(({ value }) => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  // Build a weighted pool: each number gets weight proportional to frequency
  const pool = [];
  for (let n = 1; n <= 45; n++) {
    const weight = frequency[n] || 1; // fallback weight of 1 for unplayed scores
    for (let i = 0; i < weight; i++) {
      pool.push(n);
    }
  }

  // Shuffle and pick 5 unique values
  const picked = new Set();
  let attempts = 0;
  while (picked.size < 5 && attempts < 10000) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.add(pool[idx]);
    attempts++;
  }

  // Fallback to random if algo fails to pick 5
  if (picked.size < 5) return randomDraw();

  return Array.from(picked).sort((a, b) => a - b);
};

/**
 * Check how many of the drawn numbers a score array matches
 * @param {number[]} drawnNumbers  - 5-number draw result
 * @param {number[]} userScores    - up to 5 user score values
 * @returns {number} count of matches
 */
const countMatches = (drawnNumbers, userScores) => {
  const drawnSet = new Set(drawnNumbers);
  return userScores.filter((s) => drawnSet.has(s)).length;
};

/**
 * Match all subscribed users against drawn numbers
 * Returns { fiveMatch, fourMatch, threeMatch } arrays of userId strings
 * @param {number[]} drawnNumbers
 * @param {string[]} subscriberIds  - array of active user ObjectId strings
 * @returns {Promise<{fiveMatch: string[], fourMatch: string[], threeMatch: string[]}>}
 */
const matchSubscribers = async (drawnNumbers, subscriberIds) => {
  const fiveMatch = [];
  const fourMatch = [];
  const threeMatch = [];

  for (const userId of subscriberIds) {
    // Get latest 5 scores for this user in descending date order
    const scores = await Score.find({ userId })
      .sort({ datePlayed: -1 })
      .limit(5)
      .select('value');

    const values = scores.map((s) => s.value);
    const matches = countMatches(drawnNumbers, values);

    if (matches === 5) fiveMatch.push(userId);
    else if (matches === 4) fourMatch.push(userId);
    else if (matches === 3) threeMatch.push(userId);
  }

  return { fiveMatch, fourMatch, threeMatch };
};

module.exports = { randomDraw, algorithmicDraw, matchSubscribers, countMatches };
