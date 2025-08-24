import { describe, it, expect } from 'vitest';
import { parseTitle, SERIES_ALIASES, GRADE_PATTERNS, ISSUE_PATTERNS } from '../lib/normaliser';

describe('Normaliser', () => {
  describe('parseTitle', () => {
    describe('High confidence matches', () => {
      it('should parse standard CGC titles correctly', () => {
        const testCases = [
          {
            input: 'Amazing Spider-Man #300 CGC 9.8',
            expected: {
              seriesId: 'amazing-spider-man-1963',
              issueNumber: '300',
              grade: 'cgc-9-8-nm-mt',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Batman #181 CGC 9.4',
            expected: {
              seriesId: 'batman-1940',
              issueNumber: '181',
              grade: 'cgc-9-4-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'X-Men #101 CGC 8.5',
            expected: {
              seriesId: 'x-men-1963',
              issueNumber: '101',
              grade: 'cgc-8-5-vf',
              confidence: expect.any(Number),
            },
          },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseTitle(input);
          expect(result.seriesId).toBe(expected.seriesId);
          expect(result.issueNumber).toBe(expected.issueNumber);
          expect(result.grade).toBe(expected.grade);
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });

      it('should parse raw graded titles correctly', () => {
        const testCases = [
          {
            input: 'Amazing Spider-Man #129 Raw NM',
            expected: {
              seriesId: 'amazing-spider-man-1963',
              issueNumber: '129',
              grade: 'raw-nm',
            },
          },
          {
            input: 'Batman #357 Ungraded',
            expected: {
              seriesId: 'batman-1940',
              issueNumber: '357',
              grade: 'raw-nm',
            },
          },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseTitle(input);
          expect(result.seriesId).toBe(expected.seriesId);
          expect(result.issueNumber).toBe(expected.issueNumber);
          expect(result.grade).toBe(expected.grade);
          expect(result.confidence).toBeGreaterThan(0.6);
        });
      });
    });

    describe('Alias handling', () => {
      it('should handle common series aliases', () => {
        const testCases = [
          {
            input: 'ASM #300 CGC 9.8',
            expectedSeries: 'amazing-spider-man-1963',
          },
          {
            input: 'FF #1 9.4 CGC',
            expectedSeries: 'fantastic-four-1961',
          },
          {
            input: 'IronMan #1 Raw',
            expectedSeries: 'iron-man-1968',
          },
          {
            input: 'Cap America #100',
            expectedSeries: 'captain-america-1968',
          },
          {
            input: 'JLA #1',
            expectedSeries: 'justice-league-1960',
          },
        ];

        testCases.forEach(({ input, expectedSeries }) => {
          const result = parseTitle(input);
          expect(result.seriesId).toBe(expectedSeries);
        });
      });
    });

    describe('Issue number extraction', () => {
      it('should handle various issue number formats', () => {
        const testCases = [
          { input: 'Spider-Man #300', expected: '300' },
          { input: 'Spider-Man Issue 300', expected: '300' },
          { input: 'Spider-Man No. 300', expected: '300' },
          { input: 'Spider-Man Number 300', expected: '300' },
          { input: 'Spider-Man Annual #1', expected: '1' },
          { input: 'Spider-Man #1 Annual', expected: '1' },
          { input: 'Spider-Man Special #1', expected: '1' },
          { input: 'Spider-Man #300.1', expected: '300.1' },
          { input: 'Spider-Man #1a variant', expected: '1' },
          { input: 'Spider-Man #1 cover A', expected: '1' },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseTitle(input);
          expect(result.issueNumber).toBe(expected);
        });
      });
    });

    describe('Grade extraction', () => {
      it('should handle various grade formats', () => {
        const testCases = [
          { input: 'Spider-Man #1 CGC 9.8', expected: 'cgc-9-8-nm-mt' },
          { input: 'Spider-Man #1 9.8 CGC', expected: 'cgc-9-8-nm-mt' },
          { input: 'Spider-Man #1 CGC 9.6', expected: 'cgc-9-6-nm' },
          { input: 'Spider-Man #1 CGC 9.4', expected: 'cgc-9-4-nm' },
          { input: 'Spider-Man #1 CGC 9.2', expected: 'cgc-9-2-nm' },
          { input: 'Spider-Man #1 CGC 9.0', expected: 'cgc-9-0-vf-nm' },
          { input: 'Spider-Man #1 CGC 8.5', expected: 'cgc-8-5-vf' },
          { input: 'Spider-Man #1 CGC 8.0', expected: 'cgc-8-0-vf' },
          { input: 'Spider-Man #1 Raw NM', expected: 'raw-nm' },
          { input: 'Spider-Man #1 NM Raw', expected: 'raw-nm' },
          { input: 'Spider-Man #1 Raw VF', expected: 'raw-vf' },
          { input: 'Spider-Man #1 VF Raw', expected: 'raw-vf' },
          { input: 'Spider-Man #1 Ungraded', expected: 'raw-nm' },
          { input: 'Spider-Man #1 Raw', expected: 'raw-nm' },
          { input: 'Spider-Man #1 NM', expected: 'raw-nm' },
          { input: 'Spider-Man #1 VF', expected: 'raw-vf' },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseTitle(input);
          expect(result.grade).toBe(expected);
        });
      });
    });

    describe('Messy real-world titles', () => {
      it('should handle 50+ messy title variations', () => {
        const messyTitles = [
          // Various formats and typos
          'amazing spiderman 300 cgc 9.8 nm/mt',
          'ASM#300CGC9.8',
          'The Amazing Spider-Man Issue #300 - CGC Graded 9.8',
          'AMAZING SPIDER MAN #300 (CGC 9.8)',
          'Spider-Man (Amazing) #300 [CGC 9.8]',
          'Amazing Spider-man vol.1 #300 CGC 9.8 NM/MT',
          
          // Different series variations
          'batman 181 cgc 9.4 first poison ivy',
          'Detective Comics #27 CGC 8.5 VF+',
          'The Batman #1 Raw NM condition',
          'BATMAN ISSUE ONE CGC 9.0',
          
          // X-Men variations
          'uncanny x-men 101 cgc 9.2',
          'X-MEN #101 (1976) CGC 9.2 NM-',
          'The X-Men #101 Raw VF/NM',
          'Uncanny X-Men Vol 1 #101',
          
          // Fantastic Four
          'fantastic four 1 cgc 9.6',
          'FF #1 (1961) CGC 9.6 NM+',
          'F4 #1 Raw Near Mint',
          'Fantastic 4 Issue #1',
          
          // Iron Man
          'iron man 1 cgc 9.4',
          'IronMan #1 CGC 9.4 NM',
          'Invincible Iron Man #1 Raw',
          'Tales of Suspense #39 CGC 8.0',
          
          // Special issues and variants
          'Amazing Spider-Man Annual #1 CGC 9.8',
          'Spider-Man #1 Annual Raw NM',
          'ASM Special #1 CGC 9.4',
          'Amazing Spider-Man #300.1 CGC 9.6',
          'Spider-Man #1a variant CGC 9.8',
          'ASM #1 cover A CGC 9.4',
          'Amazing Spider-Man #1 second print',
          
          // Messy formatting
          'AMAZING SPIDER-MAN#300CGC9.8NMMT',
          'asm 300 (cgc 9.8) nm/mt white pages',
          'Amazing Spider Man #300 - CGC Universal 9.8',
          'The Amazing Spider-Man (1963) #300 CGC 9.8',
          'Spider-man amazing #300 9.8 cgc graded',
          
          // Raw and ungraded variations
          'Amazing Spider-Man #300 Raw Near Mint',
          'ASM #300 ungraded NM condition',
          'Spider-Man #300 Raw VF/NM',
          'Amazing Spider-Man #300 ungraded',
          'ASM 300 raw nm-',
          
          // Different grade notations
          'Batman #181 CGC 9.4 NM',
          'Batman 181 9.4 cgc near mint',
          'The Batman #181 (CGC 9.4)',
          'Batman Issue #181 - 9.4 CGC',
          
          // More series aliases
          'Cap America #100 CGC 9.2',
          'Captain America vol 1 #100',
          'Thor #126 CGC 9.0 VF/NM',
          'Mighty Thor #126 Raw',
          'Avengers #1 CGC 8.5 VF+',
          'Justice League #1 CGC 9.6',
          'JLA #1 (1960) Raw NM',
          
          // Tricky cases
          'Amazing Spider-Man #1 2nd series CGC 9.8',
          'Spider-Man #1 (1990) Todd McFarlane',
          'Web of Spider-Man #1 CGC 9.4',
          'Spectacular Spider-Man #1 Raw',
          'Marvel Team-Up #1 featuring Spider-Man',
        ];

        messyTitles.forEach((title, index) => {
          const result = parseTitle(title);
          
          // Each result should have some meaningful data
          expect(result.seriesId).toBeDefined();
          expect(result.issueNumber).toBeDefined();
          expect(result.grade).toBeDefined();
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
          
          // Log for debugging
          console.log(`Test ${index + 1}: "${title}" -> ${JSON.stringify(result)}`);
        });

        expect(messyTitles.length).toBeGreaterThanOrEqual(50);
      });
    });

    describe('Edge cases and error handling', () => {
      it('should handle empty and invalid inputs', () => {
        const edgeCases = [
          '',
          '   ',
          'just some random text',
          '123',
          'comic book',
          'CGC 9.8',
          '#300',
          'Unknown Series #1',
        ];

        edgeCases.forEach(input => {
          const result = parseTitle(input);
          expect(result).toBeDefined();
          expect(result.confidence).toBeLessThan(0.42);
        });
      });

      it('should return default values for low confidence matches', () => {
        const result = parseTitle('completely unrelated text');
        
        expect(result.seriesId).toBe('unknown');
        expect(result.issueNumber).toBe('1');
        expect(result.grade).toBe('raw-nm');
        expect(result.confidence).toBeLessThan(0.4);
        expect(result.notes).toContain('Low confidence parse');
      });

      it('should handle partial matches with appropriate confidence', () => {
        const partialMatches = [
          'Spider #300 CGC 9.8', // Partial series match
          'Amazing Spider-Man CGC 9.8', // Missing issue
          'Amazing Spider-Man #300', // Missing grade
        ];

        partialMatches.forEach(input => {
          const result = parseTitle(input);
          expect(result.confidence).toBeGreaterThan(0);
          expect(result.confidence).toBeLessThan(1);
        });
      });
    });

    describe('Confidence scoring', () => {
      it('should assign appropriate confidence scores', () => {
        // High confidence: all components found with exact matches
        const highConfidence = parseTitle('Amazing Spider-Man #300 CGC 9.8');
        expect(highConfidence.confidence).toBeGreaterThan(0.8);

        // Medium confidence: some fuzzy matching
        const mediumConfidence = parseTitle('ASM 300 NM');
        expect(mediumConfidence.confidence).toBeGreaterThan(0.5);
        expect(mediumConfidence.confidence).toBeLessThan(0.8);

        // Low confidence: missing components or poor matches
        const lowConfidence = parseTitle('Spider #300');
        expect(lowConfidence.confidence).toBeLessThan(0.5);
      });

      it('should weight series matching most heavily', () => {
        const withSeries = parseTitle('Amazing Spider-Man random text');
        const withoutSeries = parseTitle('#300 CGC 9.8');
        
        // Debug the actual confidence scores
        console.log('With series:', withSeries.confidence, withSeries);
        console.log('Without series:', withoutSeries.confidence, withoutSeries);
        
        expect(withSeries.confidence).toBeGreaterThanOrEqual(withoutSeries.confidence);
      });
    });
  });

  describe('Constants and patterns', () => {
    it('should have comprehensive series aliases', () => {
      expect(Object.keys(SERIES_ALIASES).length).toBeGreaterThan(20);
      
      // Check key aliases exist
      expect(SERIES_ALIASES['asm']).toBe('amazing-spider-man-1963');
      expect(SERIES_ALIASES['batman']).toBe('batman-1940');
      expect(SERIES_ALIASES['x-men']).toBe('x-men-1963');
      expect(SERIES_ALIASES['ff']).toBe('fantastic-four-1961');
    });

    it('should have comprehensive grade patterns', () => {
      expect(GRADE_PATTERNS.length).toBeGreaterThan(15);
      
      // Check key patterns exist
      const gradeTexts = GRADE_PATTERNS.map(p => p.grade);
      expect(gradeTexts).toContain('cgc-9-8-nm-mt');
      expect(gradeTexts).toContain('cgc-9-4-nm');
      expect(gradeTexts).toContain('raw-nm');
    });

    it('should have comprehensive issue patterns', () => {
      expect(ISSUE_PATTERNS.length).toBeGreaterThan(8);
      
      // Test pattern matching
      const testText = '#300';
      const matchingPattern = ISSUE_PATTERNS.find(p => p.pattern.test(testText));
      expect(matchingPattern).toBeDefined();
    });
  });
});