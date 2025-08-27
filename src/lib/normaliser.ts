/**
 * Title and Grade Normalisation Engine
 * 
 * Parses raw comic listing titles to extract series, issue number, and grade information
 * with confidence scoring based on pattern matching quality.
 */

// Types based on schema
export interface NormalizedListing {
  seriesId: string;
  issueNumber: string;
  grade: string;
  confidence: number; // 0 to 1
  notes?: string;
}

export interface ConfidenceScore {
  series: number;
  issue: number;
  grade: number;
  overall: number;
}

// Alias dictionary for series name normalization
export const SERIES_ALIASES: Record<string, string> = {
  // Amazing Spider-Man variants
  'asm': 'amazing-spider-man-1963',
  'amazing spider-man': 'amazing-spider-man-1963',
  'amazing spiderman': 'amazing-spider-man-1963',
  'the amazing spider-man': 'amazing-spider-man-1963',
  'amazing spider man': 'amazing-spider-man-1963',
  'spider-man': 'amazing-spider-man-1963',
  'spiderman': 'amazing-spider-man-1963',
  
  // Batman variants
  'batman': 'batman-1940',
  'the batman': 'batman-1940',
  'detective comics': 'detective-comics-1937',
  'detective': 'detective-comics-1937',
  'dc': 'detective-comics-1937',
  
  // X-Men variants
  'x-men': 'x-men-1963',
  'xmen': 'x-men-1963',
  'the x-men': 'x-men-1963',
  'uncanny x-men': 'x-men-1963',
  'uncanny xmen': 'x-men-1963',
  
  // Fantastic Four variants
  'fantastic four': 'fantastic-four-1961',
  'ff': 'fantastic-four-1961',
  'f4': 'fantastic-four-1961',
  'fantastic 4': 'fantastic-four-1961',
  
  // Iron Man variants
  'iron man': 'iron-man-1968',
  'ironman': 'iron-man-1968',
  'invincible iron man': 'iron-man-1968',
  
  // Hulk variants
  'hulk': 'incredible-hulk-1962',
  'incredible hulk': 'incredible-hulk-1962',
  'the hulk': 'incredible-hulk-1962',
  
  // Captain America variants
  'captain america': 'captain-america-1968',
  'cap america': 'captain-america-1968',
  'cap': 'captain-america-1968',
  
  // Thor variants
  'thor': 'thor-1966',
  'mighty thor': 'thor-1966',
  'the mighty thor': 'thor-1966',
  
  // Avengers variants
  'avengers': 'avengers-1963',
  'the avengers': 'avengers-1963',
  
  // Superman variants
  'superman': 'superman-1939',
  'action comics': 'action-comics-1938',
  'action': 'action-comics-1938',
  
  // Wonder Woman variants
  'wonder woman': 'wonder-woman-1942',
  'ww': 'wonder-woman-1942',
  
  // Flash variants
  'flash': 'flash-1959',
  'the flash': 'flash-1959',
  
  // Green Lantern variants
  'green lantern': 'green-lantern-1960',
  'gl': 'green-lantern-1960',
  
  // Justice League variants
  'justice league': 'justice-league-1960',
  'jla': 'justice-league-1960',
  'justice league of america': 'justice-league-1960',
};

// Grade patterns and their normalized values
export const GRADE_PATTERNS: Array<{ pattern: RegExp; grade: string; confidence: number }> = [
  // CGC Grades - more specific patterns
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
  { pattern: /cgc\s*8\.0/i, grade: 'cgc-8-0-vf', confidence: 1.0 },
  { pattern: /8\.0\s*cgc/i, grade: 'cgc-8-0-vf', confidence: 1.0 },
  { pattern: /cgc\s+graded\s*8\.0/i, grade: 'cgc-8-0-vf', confidence: 1.0 },
  
  // Raw grades
  { pattern: /raw\s*nm/i, grade: 'raw-nm', confidence: 0.8 },
  { pattern: /nm\s*raw/i, grade: 'raw-nm', confidence: 0.8 },
  { pattern: /raw\s*vf/i, grade: 'raw-vf', confidence: 0.8 },
  { pattern: /vf\s*raw/i, grade: 'raw-vf', confidence: 0.8 },
  { pattern: /ungraded/i, grade: 'raw-nm', confidence: 0.6 },
  { pattern: /\braw\b/i, grade: 'raw-nm', confidence: 0.5 },
  
  // Grade abbreviations (lower confidence) - more specific word boundaries
  { pattern: /\bnm\b/i, grade: 'raw-nm', confidence: 0.7 },
  { pattern: /\bvf\b/i, grade: 'raw-vf', confidence: 0.7 },
  { pattern: /\bfn\b/i, grade: 'raw-fn', confidence: 0.7 },
  { pattern: /\bgd\b/i, grade: 'raw-gd', confidence: 0.7 },
];

// Issue number patterns
export const ISSUE_PATTERNS: Array<{ pattern: RegExp; confidence: number }> = [
  // Standard issue numbers
  { pattern: /#(\d+(?:\.\d+)?)/i, confidence: 1.0 },
  { pattern: /issue\s*(\d+(?:\.\d+)?)/i, confidence: 0.9 },
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
export function parseTitle(rawTitle: string): NormalizedListing {
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
  const notes: string[] = [];

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
 * Extract series information from title
 */
function extractSeries(title: string): { seriesId: string; confidence: number; notes?: string } {
  // Try exact alias matches first
  for (const [alias, seriesId] of Object.entries(SERIES_ALIASES)) {
    if (title.includes(alias)) {
      return { seriesId, confidence: 1.0 };
    }
  }

  // Try partial matches with lower confidence
  const words = title.split(/\s+/);
  for (const [alias, seriesId] of Object.entries(SERIES_ALIASES)) {
    const aliasWords = alias.split(/\s+/);
    const matchCount = aliasWords.filter(word => words.includes(word)).length;
    const matchRatio = matchCount / aliasWords.length;
    
    if (matchRatio >= 0.6) {
      return { 
        seriesId, 
        confidence: matchRatio * 0.8,
        notes: `Partial series match: ${alias}`,
      };
    }
  }

  return { 
    seriesId: '', 
    confidence: 0,
    notes: 'No series match found',
  };
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
      };
    }
  }

  // Try to find any number as fallback
  const numberMatch = title.match(/\b(\d+(?:\.\d+)?)\b/);
  if (numberMatch) {
    return { 
      issueNumber: numberMatch[1], 
      confidence: 0.3,
      notes: 'Fallback number extraction',
    };
  }

  return { 
    issueNumber: '', 
    confidence: 0,
    notes: 'No issue number found',
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
      };
    }
  }

  return { 
    grade: '', 
    confidence: 0,
    notes: 'No grade found',
  };
}

/**
 * Calculate overall confidence based on individual component scores
 */
function calculateOverallConfidence(scores: ConfidenceScore): number {
  // Weighted average: series is most important, then issue, then grade
  const weights = { series: 0.5, issue: 0.3, grade: 0.2 };
  
  return (
    scores.series * weights.series +
    scores.issue * weights.issue +
    scores.grade * weights.grade
  );
}