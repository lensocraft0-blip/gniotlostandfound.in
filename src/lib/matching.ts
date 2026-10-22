import { ItemReport, ItemMatch } from '../types/database';

export interface MatchingWeights {
  category: number; // default 30
  keywords: number; // default 25
  color: number;    // default 15
  brand: number;    // default 10
  location: number; // default 15
  date: number;     // default 5
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  category: 30,
  keywords: 25,
  color: 15,
  brand: 10,
  location: 15,
  date: 5,
};

export const MATCH_THRESHOLD = 50; // Threshold required to qualify as an explainable suggestion

// Synonyms dictionary for campus everyday carry items
const SYNONYM_MAP: Record<string, string[]> = {
  phone: ['smartphone', 'mobile', 'iphone', 'android', 'cellphone', 'handset'],
  earbuds: ['earphones', 'airpods', 'headphones', 'buds', 'earpiece', 'tws'],
  calculator: ['calc', 'scientific', 'casio', 'ti84', 'graphing'],
  bottle: ['flask', 'sipper', 'tumbler', 'waterbottle', 'hydroflask', 'milton'],
  keys: ['keychain', 'keyring', 'roomkey', 'fob', 'latchkey'],
  wallet: ['purse', 'billfold', 'cardholder', 'pouch'],
  id: ['identity', 'rfid', 'badge', 'card', 'idcard', 'pass', 'admitcard'],
  bag: ['backpack', 'rucksack', 'satchel', 'tote', 'laptopbag'],
  spectacles: ['glasses', 'specs', 'sunglasses', 'shades', 'eyewear'],
  watch: ['smartwatch', 'timepiece', 'wristband', 'fastrack', 'fitbit'],
  notebook: ['register', 'diary', 'spiral', 'notepad', 'folder'],
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'have', 'this', 'that', 'near', 'some',
  'into', 'lost', 'found', 'item', 'campus', 'room', 'floor', 'block', 'hall',
  'area', 'side', 'left', 'very', 'just', 'gniot', 'please', 'help', 'about',
  'around', 'been', 'there', 'their', 'which', 'where', 'when',
]);

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
}

function expandKeywords(words: Set<string>): Set<string> {
  const expanded = new Set<string>(words);
  for (const word of words) {
    for (const [canonical, variants] of Object.entries(SYNONYM_MAP)) {
      if (word === canonical || variants.includes(word)) {
        expanded.add(canonical);
        variants.forEach((v) => expanded.add(v));
      }
    }
  }
  return expanded;
}

function extractKeywords(text: string): Set<string> {
  const rawWords = normalizeText(text)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return expandKeywords(new Set(rawWords));
}

/**
 * Multi-Stage Transparent Matching Engine
 * Returns compatibility score, matching attributes, conflicting attributes, and missing info.
 */
export function calculateItemMatch(
  lostItem: ItemReport,
  foundItem: ItemReport,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): ItemMatch | null {
  // Prevent matching an item with itself
  if (lostItem.id === foundItem.id) return null;

  // Must pair lost with found
  if (lostItem.report_type === foundItem.report_type) return null;

  const lost = lostItem.report_type === 'lost' ? lostItem : foundItem;
  const found = lostItem.report_type === 'lost' ? foundItem : lostItem;

  const matchingAttributes: string[] = [];
  const conflictingAttributes: string[] = [];
  const missingInformation: string[] = [];
  let contradictionPenalty = 0;

  // --- STAGE 1: CATEGORY COMPATIBILITY ---
  let categoryScore = 0;
  if (lost.category === found.category) {
    categoryScore = weights.category;
    matchingAttributes.push(`Identical Category: ${lost.category}`);
  } else {
    // Check if category has cross-category synonym overlap
    const lostCatWords = extractKeywords(lost.category);
    const foundCatWords = extractKeywords(found.category);
    let hasOverlap = false;
    for (const w of lostCatWords) {
      if (foundCatWords.has(w)) {
        hasOverlap = true;
        break;
      }
    }
    if (hasOverlap) {
      categoryScore = Math.round(weights.category * 0.5);
      matchingAttributes.push(`Compatible Category: ${lost.category} ~ ${found.category}`);
    } else {
      conflictingAttributes.push(`Different Categories: "${lost.category}" vs "${found.category}"`);
      contradictionPenalty += 30; // Strong penalty for contradictory categories
    }
  }

  // --- STAGE 2: BRAND & MODEL COMPARISON ---
  let brandScore = 0;
  const lostBrand = (lost.brand || '').trim().toLowerCase();
  const foundBrand = (found.brand || '').trim().toLowerCase();

  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      brandScore = weights.brand;
      matchingAttributes.push(`Matching Brand: ${lost.brand}`);
    } else {
      conflictingAttributes.push(`Brand Contradiction: "${lost.brand}" vs "${found.brand}"`);
      contradictionPenalty += 20; // Distinct brands contradict
    }
  } else {
    if (!lostBrand && !foundBrand) {
      missingInformation.push('Brand unstated on both reports');
    } else if (!lostBrand) {
      missingInformation.push(`Brand "${found.brand}" reported on found item but not specified on lost report`);
    } else {
      missingInformation.push(`Brand "${lost.brand}" reported on lost item but unverified on found item`);
    }
  }

  // --- STAGE 3: COLOR COMPARISON ---
  let colorScore = 0;
  const lostColor = (lost.color || '').trim().toLowerCase();
  const foundColor = (found.color || '').trim().toLowerCase();

  if (lostColor && foundColor) {
    if (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      colorScore = weights.color;
      matchingAttributes.push(`Matching Color: ${lost.color}`);
    } else {
      conflictingAttributes.push(`Color Conflict: "${lost.color}" vs "${found.color}"`);
      contradictionPenalty += 15; // Contradictory colors
    }
  } else {
    missingInformation.push('Color unverified');
  }

  // --- STAGE 4: KEYWORDS & TEXT REASONING ---
  const lostKeywords = extractKeywords(`${lost.title} ${lost.description}`);
  const foundKeywords = extractKeywords(`${found.title} ${found.description}`);

  let sharedKeywordsCount = 0;
  const matchedWordsList: string[] = [];

  for (const word of lostKeywords) {
    if (foundKeywords.has(word)) {
      sharedKeywordsCount++;
      matchedWordsList.push(word);
    }
  }

  const keywordRatio =
    lostKeywords.size > 0 ? Math.min(1, sharedKeywordsCount / Math.min(lostKeywords.size, 6)) : 0;
  const keywordScore = Math.round(keywordRatio * weights.keywords);

  if (matchedWordsList.length > 0) {
    matchingAttributes.push(`Shared Specifics: ${matchedWordsList.slice(0, 4).join(', ')}`);
  }

  // --- STAGE 5: CAMPUS LOCATION PROXIMITY ---
  let locationScore = 0;
  const lostLoc = normalizeText(lost.campus_location || '');
  const foundLoc = normalizeText(found.campus_location || '');

  if (lostLoc && foundLoc) {
    if (lostLoc === foundLoc) {
      locationScore = weights.location;
      matchingAttributes.push(`Exact Location Match: ${lost.campus_location}`);
    } else if (
      (lost.campus_zone && found.campus_zone && lost.campus_zone === found.campus_zone) ||
      (lostLoc.includes('academic') && foundLoc.includes('academic')) ||
      (lostLoc.includes('library') && foundLoc.includes('library')) ||
      (lostLoc.includes('hostel') && foundLoc.includes('hostel'))
    ) {
      locationScore = Math.round(weights.location * 0.7);
      matchingAttributes.push(`Zone Proximity: ${lost.campus_zone || 'Nearby campus quadrant'}`);
    } else {
      missingInformation.push(`Reported at separate campus zones: ${lost.campus_location} vs ${found.campus_location}`);
    }
  }

  // --- STAGE 6: DATE PROXIMITY ---
  let dateScore = 0;
  if (lost.event_date && found.event_date) {
    const lDate = new Date(lost.event_date).getTime();
    const fDate = new Date(found.event_date).getTime();
    if (!isNaN(lDate) && !isNaN(fDate)) {
      const diffDays = Math.abs(fDate - lDate) / (1000 * 60 * 60 * 24);
      if (diffDays <= 3) {
        dateScore = weights.date;
        matchingAttributes.push(`Close Date Proximity: within ${Math.ceil(diffDays)} day(s)`);
      } else if (diffDays <= 10) {
        dateScore = Math.round(weights.date * 0.6);
        matchingAttributes.push(`Date Proximity: within ${Math.ceil(diffDays)} days`);
      } else {
        conflictingAttributes.push(`Date Disparity: ${Math.ceil(diffDays)} days between reported events`);
        contradictionPenalty += 10;
      }
    }
  }

  // Calculate gross score and apply meaningful contradiction penalties
  const grossScore = categoryScore + keywordScore + colorScore + brandScore + locationScore + dateScore;
  const netScore = Math.max(0, Math.min(100, grossScore - contradictionPenalty));

  // Build transparent human explanation
  const explanationParts: string[] = [];
  if (matchingAttributes.length > 0) {
    explanationParts.push(`Aligns on: ${matchingAttributes.join(' · ')}`);
  }
  if (conflictingAttributes.length > 0) {
    explanationParts.push(`Contradictions noted: ${conflictingAttributes.join(' · ')}`);
  }
  if (missingInformation.length > 0) {
    explanationParts.push(`Missing details: ${missingInformation.join(' · ')}`);
  }

  const finalExplanation =
    explanationParts.length > 0
      ? explanationParts.join('\n')
      : 'Insufficient matching attributes to indicate correspondence.';

  return {
    id: `match_${lost.id.slice(0, 8)}_${found.id.slice(0, 8)}`,
    lost_item_id: lost.id,
    found_item_id: found.id,
    lost_item: lost,
    found_item: found,
    score: netScore,
    matching_attributes: matchingAttributes,
    conflicting_attributes: conflictingAttributes,
    missing_information: missingInformation,
    explanation: finalExplanation,
    factor_breakdown: {
      category_score: categoryScore,
      keyword_score: keywordScore,
      color_score: colorScore,
      brand_score: brandScore,
      location_score: locationScore,
      date_score: dateScore,
      contradiction_penalty: contradictionPenalty,
    },
    status: netScore >= 70 ? 'confirmed_match' : 'pending',
    created_at: new Date().toISOString(),
  };
}

/**
 * Candidate suggestions from candidate pool
 */
export function findSuggestedMatches(
  targetItem: ItemReport,
  candidateItems: ItemReport[],
  threshold: number = MATCH_THRESHOLD
): ItemMatch[] {
  const matches: ItemMatch[] = [];

  for (const candidate of candidateItems) {
    if (candidate.id === targetItem.id) continue;
    if (candidate.report_type === targetItem.report_type) continue;
    if (candidate.status === 'resolved' || candidate.status === 'archived') continue;

    const match = calculateItemMatch(targetItem, candidate);
    if (match && match.score >= threshold) {
      matches.push(match);
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
