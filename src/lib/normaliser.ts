import { ParsedTitle, NormalizedListing, ConfidenceScore } from './types';

// Series aliases for common abbreviations and variations
export const SERIES_ALIASES: Record<string, string> = {
  'asm': 'amazing-spider-man-1963',
  'amazing spider-man': 'amazing-spider-man-1963',
  'amazing spiderman': 'amazing-spider-man-1963',
  'batman': 'batman-1940',
  'detective comics': 'detective-comics-1937',
  'detective': 'detective-comics-1937',
  'dc': 'detective-comics-1937',
  'ff': 'fantastic-four-1961',
  'fantastic four': 'fantastic-four-1961',
  'fantastic 4': 'fantastic-four-1961',
  'x-men': 'x-men-1963',
  'xmen': 'x-men-1963',
  'uncanny x-men': 'x-men-1963',
  'superman': 'superman-1939',
  'action comics': 'action-comics-1938',
  'action': 'action-comics-1938',
  'iron man': 'iron-man-1968',
  'ironman': 'iron-man-1968',
  'cap america': 'captain-america-1968',
  'captain america': 'captain-america-1968',
  'cap': 'captain-america-1968',
  'thor': 'thor-1962',
  'mighty thor': 'thor-1962',
  'hulk': 'hulk-1962',
  'incredible hulk': 'hulk-1962',
  'avengers': 'avengers-1963',
  'justice league': 'justice-league-1960',
  'jla': 'justice-league-1960',
  'jl': 'justice-league-1960',
};

// Grade patterns with confidence scores
export const GRADE_PATTERNS = [
  // CGC Grades - highest confidence
  { pattern: /cgc\s*9\.8/i, grade: 'cgc-9-8-nm-mt', confidence: 1.0 },
  { pattern: /9\.8\s*cgc/i, grade: 'cgc-9-8-nm-mt', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*9\.8/i, grade: 'cgc-9-8-nm-mt', confidence: 1.0 },
  { pattern: /cgc\s*9\.6/i, grade: 'cgc-9-6-nm', confidence: 1.0 },
  { pattern: /9\.6\s*cgc/i, grade: 'cgc-9-6-nm', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*9\.6/i, grade: 'cgc-9-6-nm', confidence: 1.0 },
  { pattern: /cgc\s*9\.4/i, grade: 'cgc-9-4-nm', confidence: 1.0 },
  { pattern: /9\.4\s*cgc/i, grade: 'cgc-9-4-nm', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*9\.4/i, grade: 'cgc-9-4-nm', confidence: 1.0 },
  { pattern: /cgc\s*9\.2/i, grade: 'cgc-9-2-nm', confidence: 1.0 },
  { pattern: /9\.2\s*cgc/i, grade: 'cgc-9-2-nm', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*9\.2/i, grade: 'cgc-9-2-nm', confidence: 1.0 },
  { pattern: /cgc\s*9\.0/i, grade: 'cgc-9-0-vf-nm', confidence: 1.0 },
  { pattern: /9\.0\s*cgc/i, grade: 'cgc-9-0-vf-nm', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*9\.0/i, grade: 'cgc-9-0-vf-nm', confidence: 1.0 },
  { pattern: /cgc\s*8\.5/i, grade: 'cgc-8-5-vf', confidence: 1.0 },
  { pattern: /8\.5\s*cgc/i, grade: 'cgc-8-5-vf', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*8\.5/i, grade: 'cgc-8-5-vf', confidence: 1.0 },
  
  // Raw grades - medium confidence
  { pattern: /\b(vf-nm|very fine near mint)\b/i, grade: 'raw-vf-nm', confidence: 0.8 },
  { pattern: /\b(nm|near mint)\b/i, grade: 'raw-nm', confidence: 0.8 },
  { pattern: /\b(nm-|near mint-)\b/i, grade: 'raw-nm-', confidence: 0.8 },
  { pattern: /\b(vf|very fine)\b/i, grade: 'raw-vf', confidence: 0.8 },
  { pattern: /\b(fn|fine)\b/i, grade: 'raw-fn', confidence: 0.7 },
  { pattern: /\b(vg|very good)\b/i, grade: 'raw-vg', confidence: 0.7 },
  { pattern: /\b(gd|good)\b/i, grade: 'raw-gd', confidence: 0.7 },
  { pattern: /\b(fr|fair)\b/i, grade: 'raw-fr', confidence: 0.7 },
  { pattern: /\b(pr|poor)\b/i, grade: 'raw-pr', confidence: 0.7 },
  { pattern: /\braw\b/i, grade: 'raw-nm', confidence: 0.6 },
  { pattern: /\bungraded\b/i, grade: 'raw-nm', confidence: 0.5 },
];

// Issue number patterns with confidence scores
export const ISSUE_PATTERNS = [
  // Standard formats - highest confidence
  { pattern: /#(\d+(?:\.\d+)?)\b/i, confidence: 1.0 },
  { pattern: /issue\s*#?(\d+(?:\.\d+)?)/i, confidence: 0.9 },
  { pattern: /no\.?\s*(\d+(?:\.\d+)?)/i, confidence: 0.9 },
  { pattern: /number\s*(\d+(?:\.\d+)?)/i, confidence: 0.8 },
  
  // Special issues
  { pattern: /annual\s*#?(\d+)/i, confidence: 0.9 },
  { pattern: /#?(\d+)\s*annual/i, confidence: 0.9 },
  { pattern: /special\s*#?(\d+)/i, confidence: 0.8 },
  { pattern: /#?(\d+)\s*special/i, confidence: 0.8 },
  
  // Variants and covers
  { pattern: /#(\d+(?:\.\d+)?)\s*[a-z]/i, confidence: 0.8 }, // #1a, #1b, etc.
  { pattern: /#(\d+(?:\.\d+)?)\s*variant/i, confidence: 0.8 },
  { pattern: /#(\d+(?:\.\d+)?)\s*cover/i, confidence: 0.7 },
];

/**
 * Parse a raw title string to extract normalized comic information
 */
export function parseNormalizedTitle(rawTitle: string): NormalizedListing {
  const title = rawTitle.toLowerCase().trim();
  const confidenceScores: ConfidenceScore = {
    series: 0,
    issue: 0,
    grade: 0,
    overall: 0,
  };
  
  let seriesId = '';
  let issueNumber = '';
  let grade = '';
  let notes: string[] = [];

  // 1. Extract series information
  const seriesResult = extractSeries(title);
  seriesId = seriesResult.seriesId;
  confidenceScores.series = seriesResult.confidence;
  if (seriesResult.notes) notes.push(seriesResult.notes);

  // 2. Extract issue number
  const issueResult = extractIssueNumber(title);
  issueNumber = issueResult.issueNumber;
  confidenceScores.issue = issueResult.confidence;
  if (issueResult.notes) notes.push(issueResult.notes);

  // 3. Extract grade
  const gradeResult = extractGrade(title);
  grade = gradeResult.grade;
  confidenceScores.grade = gradeResult.confidence;
  if (gradeResult.notes) notes.push(gradeResult.notes);

  // 4. Calculate overall confidence
  confidenceScores.overall = calculateOverallConfidence(confidenceScores);

  // 5. Apply fallbacks for low confidence
  if (confidenceScores.overall < 0.4) {
    return {
      seriesId: seriesId || 'unknown',
      issueNumber: issueNumber || '1',
      grade: grade || 'raw-nm',
      confidence: confidenceScores.overall,
      notes: `Low confidence parse: ${notes.join('; ')}`,
    };
  }

  return {
    seriesId: seriesId || 'unknown',
    issueNumber: issueNumber || '1',
    grade: grade || 'raw-nm',
    confidence: confidenceScores.overall,
    notes: notes.length > 0 ? notes.join('; ') : undefined,
  };
}

/**
 * Backward compatible parseTitle function for existing code
 * Parses a comic book title to extract series and issue information
 * @param title - The raw title string to parse
 * @returns Parsed title components
 */
export function parseTitle(title: string): ParsedTitle {
  // Use the new sophisticated parser internally but return legacy format
  const normalized = parseNormalizedTitle(title);
  
  // Convert seriesId back to alias format for backward compatibility
  let series = normalized.seriesId;
  
  // Handle known series mappings to return aliases expected by existing code
  if (normalized.seriesId === 'amazing-spider-man-1963') {
    series = 'asm';
  } else if (normalized.seriesId === 'batman-1940') {
    series = 'batman';
  } else if (normalized.seriesId === 'x-men-1963') {
    series = 'x-men';
  } else if (normalized.seriesId === 'fantastic-four-1961') {
    series = 'ff';
  } else if (normalized.seriesId === 'iron-man-1968') {
    series = 'iron man';
  } else if (normalized.seriesId === 'thor-1962') {
    series = 'thor';
  } else if (normalized.seriesId === 'hulk-1962') {
    series = 'hulk';
  } else if (normalized.seriesId === 'avengers-1963') {
    series = 'avengers';
  } else if (normalized.seriesId === 'captain-america-1968') {
    series = 'captain america';
  } else if (normalized.seriesId === 'superman-1939') {
    series = 'superman';
  } else if (normalized.seriesId === 'detective-comics-1937') {
    series = 'detective comics';
  } else if (normalized.seriesId === 'action-comics-1938') {
    series = 'action comics';
  } else if (normalized.seriesId === 'justice-league-1960') {
    series = 'justice league';
  } else if (normalized.seriesId.endsWith('-unknown-year')) {
    // Strip the -unknown-year suffix and convert back to readable format
    series = normalized.seriesId
      .replace(/-unknown-year$/, '')
      .replace(/-/g, ' ');
  } else if (normalized.seriesId === 'unknown') {
    series = title; // Fallback to original title
  }

  return {
    series: series,
    issueNumber: normalized.issueNumber,
    variant: undefined, // Could extract from notes if needed
  };
}

/**
 * Extract series information from title
 */
function extractSeries(title: string): { seriesId: string; confidence: number; notes?: string } {
  // Check for exact matches and aliases first - highest confidence
  for (const [alias, seriesId] of Object.entries(SERIES_ALIASES)) {
    if (title.includes(alias)) {
      return {
        seriesId,
        confidence: 0.9,
        notes: `Matched alias: ${alias}`,
      };
    }
  }

  // Try to extract series name by removing issue and grade info
  let cleanTitle = title
    .replace(/#\d+.*$/, '') // Remove issue number and everything after
    .replace(/\b(cgc|raw|nm|vf|fn|gd|pr|fr)\b.*$/, '') // Remove grade info
    .replace(/\b\d+(\.\d+)?\b/, '') // Remove standalone numbers
    .trim();

  // Only proceed if we have a meaningful length string, contains real words, and doesn't look like generic text
  if (cleanTitle.length > 6 && /[a-zA-Z]{3,}/.test(cleanTitle) && !isGenericText(cleanTitle)) {
    // Convert to series ID format
    const seriesId = cleanTitle
      .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();
    
    return {
      seriesId: seriesId + '-unknown-year',
      confidence: 0.6,
      notes: `Extracted from title: ${cleanTitle}`,
    };
  }

  return {
    seriesId: 'unknown',
    confidence: 0,
    notes: 'No series match found',
  };
}

/**
 * Check if text appears to be generic/unrelated to comics
 */
function isGenericText(text: string): boolean {
  const genericTerms = [
    'completely', 'unrelated', 'text', 'random', 'some',
    'just', 'test', 'sample', 'example', 'demo'
  ];
  
  const lowerText = text.toLowerCase();
  return genericTerms.some(term => lowerText.includes(term));
}

/**
 * Extract issue number from title
 */
function extractIssueNumber(title: string): { issueNumber: string; confidence: number; notes?: string } {
  for (const pattern of ISSUE_PATTERNS) {
    const match = title.match(pattern.pattern);
    if (match && match[1]) {
      return {
        issueNumber: match[1],
        confidence: pattern.confidence,
        notes: `Matched pattern: ${pattern.pattern.source}`,
      };
    }
  }

  return {
    issueNumber: '1',
    confidence: 0,
    notes: 'No issue number found, defaulting to 1',
  };
}

/**
 * Extract grade from title
 */
function extractGrade(title: string): { grade: string; confidence: number; notes?: string } {
  for (const pattern of GRADE_PATTERNS) {
    if (pattern.pattern.test(title)) {
      return {
        grade: pattern.grade,
        confidence: pattern.confidence,
        notes: `Matched grade pattern: ${pattern.pattern.source}`,
      };
    }
  }

  return {
    grade: 'raw-nm',
    confidence: 0.2,
    notes: 'No grade found, defaulting to raw-nm',
  };
}

/**
 * Calculate overall confidence based on individual component scores
 */
function calculateOverallConfidence(scores: ConfidenceScore): number {
  // Weighted average - series and issue are most important
  const weights = {
    series: 0.4,
    issue: 0.3,
    grade: 0.3,
  };

  return (
    scores.series * weights.series +
    scores.issue * weights.issue +
    scores.grade * weights.grade
  );
}