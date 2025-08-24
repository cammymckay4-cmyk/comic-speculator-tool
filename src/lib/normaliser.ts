import { ParsedTitle } from './types';

/**
 * Parses a comic book title to extract series and issue information
 * @param title - The raw title string to parse
 * @returns Parsed title components
 */
export function parseTitle(title: string): ParsedTitle {
  // Simplified parser - in a real implementation this would be much more sophisticated
  const patterns = [
    // "Amazing Spider-Man #300" format
    /^(.+?)\s*#(\d+(?:\.\d+)?)\s*(.*)$/,
    // "Batman 181" format  
    /^(.+?)\s+(\d+(?:\.\d+)?)\s*(.*)$/,
    // "X-Men Vol 1 #101" format
    /^(.+?)\s+Vol\s+\d+\s*#(\d+(?:\.\d+)?)\s*(.*)$/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const [, series, issueNumber, variant] = match;
      return {
        series: series.trim(),
        issueNumber: issueNumber.trim(),
        variant: variant?.trim() || undefined,
      };
    }
  }

  // Fallback for unparseable titles
  return {
    series: title,
    issueNumber: '1',
  };
}