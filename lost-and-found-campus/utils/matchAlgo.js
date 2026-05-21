/**
 * Smart Matching Algorithm
 * Finds potential matches between lost and found items
 *
 * SYLLABUS CONCEPT: Algorithm implementation, Non-blocking operations
 * - Compares items based on multiple criteria
 * - Scoring system for match confidence
 * - Used when new items are reported
 */

/**
 * Common stopwords to remove from descriptions
 * Improves keyword matching quality
 */
const stopwords = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
  'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i',
  'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours',
  'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them',
  'their', 'what', 'which', 'who', 'whom', 'lost', 'found', 'item',
]);

/**
 * Tokenize text into keywords
 * Removes stopwords and special characters
 */
const tokenize = (text) => {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopwords.has(word)); // Filter stopwords and short words
};

/**
 * Calculate string similarity (simple Levenshtein-based)
 * Returns a score between 0 and 1
 */
const stringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.7;

  // Simple word overlap
  const words1 = new Set(tokenize(s1));
  const words2 = new Set(tokenize(s2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let matches = 0;
  words1.forEach(word => {
    if (words2.has(word)) matches++;
  });

  return matches / Math.max(words1.size, words2.size);
};

/**
 * Calculate match score between two items
 * SYLLABUS CONCEPT: Scoring algorithm
 *
 * Scoring breakdown:
 * - Category match: 3 points (exact)
 * - Location similarity: 0-2 points
 * - Keyword overlap: 1 point per matching keyword (max 5)
 * - Title similarity: 0-3 points
 * - Date proximity: 0-2 points (within 7 days)
 */
const calculateMatchScore = (item1, item2) => {
  let score = 0;
  const details = [];

  // 1. Category match (3 points)
  if (item1.category === item2.category) {
    score += 3;
    details.push('Category match (+3)');
  }

  // 2. Location similarity (0-2 points)
  const locationSimilarity = stringSimilarity(item1.location, item2.location);
  if (locationSimilarity > 0.8) {
    score += 2;
    details.push('Location strong match (+2)');
  } else if (locationSimilarity > 0.5) {
    score += 1;
    details.push('Location partial match (+1)');
  }

  // 3. Keyword overlap (1 point per match, max 5)
  const keywords1 = new Set(item1.keywords || tokenize(item1.description));
  const keywords2 = new Set(item2.keywords || tokenize(item2.description));

  let keywordMatches = 0;
  keywords1.forEach(keyword => {
    if (keywords2.has(keyword)) keywordMatches++;
  });

  const keywordScore = Math.min(keywordMatches, 5);
  score += keywordScore;
  if (keywordMatches > 0) {
    details.push(`Keywords matched: ${keywordMatches} (+${keywordScore})`);
  }

  // 4. Title similarity (0-3 points)
  const titleSimilarity = stringSimilarity(item1.title, item2.title);
  if (titleSimilarity > 0.8) {
    score += 3;
    details.push('Title strong match (+3)');
  } else if (titleSimilarity > 0.5) {
    score += 1;
    details.push('Title partial match (+1)');
  }

  // 5. Date proximity (0-2 points)
  if (item1.date && item2.date) {
    const date1 = new Date(item1.date);
    const date2 = new Date(item2.date);
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 3) {
      score += 2;
      details.push('Date close match (+2)');
    } else if (daysDiff <= 7) {
      score += 1;
      details.push('Date within week (+1)');
    }
  }

  return { score, details };
};

/**
 * Find matches for an item in a list of candidate items
 * SYLLABUS CONCEPT: Array operations, Filtering
 *
 * @param {Object} newItem - The item to find matches for
 * @param {Array} candidates - Array of candidate items to search
 * @param {Number} threshold - Minimum score to consider a match (default: 5)
 * @returns {Array} Array of matched items with scores
 */
const findMatches = (newItem, candidates, threshold = 5) => {
  if (!newItem || !candidates || candidates.length === 0) {
    return [];
  }

  const matches = [];

  candidates.forEach(candidate => {
    // Skip same item
    if (candidate._id.toString() === newItem._id.toString()) {
      return;
    }

    // Calculate match score
    const { score, details } = calculateMatchScore(newItem, candidate);

    // If score meets threshold, add to matches
    if (score >= threshold) {
      matches.push({
        item: candidate,
        score,
        details,
        confidence: score >= 10 ? 'high' : score >= 7 ? 'medium' : 'low',
      });
    }
  });

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

/**
 * Quick match check (boolean)
 * Returns true if any match found above threshold
 */
const hasMatch = (newItem, candidates, threshold = 5) => {
  const matches = findMatches(newItem, candidates, threshold);
  return matches.length > 0;
};

/**
 * Get best match
 * Returns the single best match or null
 */
const getBestMatch = (newItem, candidates, threshold = 5) => {
  const matches = findMatches(newItem, candidates, threshold);
  return matches.length > 0 ? matches[0] : null;
};

module.exports = {
  findMatches,
  hasMatch,
  getBestMatch,
  calculateMatchScore,
  tokenize,
  stringSimilarity,
  stopwords,
};
