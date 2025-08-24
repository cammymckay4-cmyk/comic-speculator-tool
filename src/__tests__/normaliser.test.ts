import { describe, it, expect } from 'vitest';
import { parseNormalizedTitle, parseTitle, SERIES_ALIASES, GRADE_PATTERNS, ISSUE_PATTERNS } from '../lib/normaliser';

describe('Normaliser', () => {
  describe('parseNormalizedTitle', () => {
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
            input: 'X-Men #1 CGC 9.6',
            expected: {
              seriesId: 'x-men-1963',
              issueNumber: '1',
              grade: 'cgc-9-6-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Fantastic Four #1 CGC 9.2',
            expected: {
              seriesId: 'fantastic-four-1961',
              issueNumber: '1',
              grade: 'cgc-9-2-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Iron Man #1 Raw NM',
            expected: {
              seriesId: 'iron-man-1968',
              issueNumber: '1',
              grade: 'raw-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Thor #337 Raw VF-NM',
            expected: {
              seriesId: 'thor-1962',
              issueNumber: '337',
              grade: 'raw-vf-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Hulk #181 Raw VF',
            expected: {
              seriesId: 'hulk-1962',
              issueNumber: '181',
              grade: 'raw-vf',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Avengers #4 Raw FN',
            expected: {
              seriesId: 'avengers-1963',
              issueNumber: '4',
              grade: 'raw-fn',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Detective Comics #27 CGC 8.5',
            expected: {
              seriesId: 'detective-comics-1937',
              issueNumber: '27',
              grade: 'cgc-8-5-vf',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Action Comics #1 Raw GD',
            expected: {
              seriesId: 'action-comics-1938',
              issueNumber: '1',
              grade: 'raw-gd',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Captain America #100 Raw VG',
            expected: {
              seriesId: 'captain-america-1968',
              issueNumber: '100',
              grade: 'raw-vg',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Justice League #1 Raw FR',
            expected: {
              seriesId: 'justice-league-1960',
              issueNumber: '1',
              grade: 'raw-fr',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Superman #357 Raw PR',
            expected: {
              seriesId: 'superman-1939',
              issueNumber: '357',
              grade: 'raw-pr',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Web of Spider-Man #1 Raw',
            expected: {
              seriesId: 'web-of-spider-man-unknown-year',
              issueNumber: '1',
              grade: 'raw-nm',
              confidence: expect.any(Number),
            },
          },
          {
            input: 'Spectacular Spider-Man #357 Raw',
            expected: {
              seriesId: 'spectacular-spider-man-unknown-year',
              issueNumber: '357',
              grade: 'raw-nm',
            },
          },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseNormalizedTitle(input);
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
            input: 'Detective #27',
            expectedSeries: 'detective-comics-1937',
          },
          {
            input: 'Action #1',
            expectedSeries: 'action-comics-1938',
          },
          {
            input: 'JLA #1',
            expectedSeries: 'justice-league-1960',
          },
        ];

        testCases.forEach(({ input, expectedSeries }) => {
          const result = parseNormalizedTitle(input);
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
          { input: 'Spider-Man #1 Special', expected: '1' },
          { input: 'Spider-Man #1a Variant', expected: '1' },
          { input: 'Spider-Man #1 Variant Cover', expected: '1' },
          { input: 'Spider-Man #1.5', expected: '1.5' },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = parseNormalizedTitle(input);
          expect(result.issueNumber).toBe(expected);
        });
      });
    });

    describe('Grade extraction', () => {
      it('should correctly identify CGC grades', () => {
        const testCases = [
          { input: 'Spider-Man #1 CGC 9.8', expectedGrade: 'cgc-9-8-nm-mt' },
          { input: 'Spider-Man #1 9.6 CGC', expectedGrade: 'cgc-9-6-nm' },
          { input: 'Spider-Man #1 CGC Graded 9.4', expectedGrade: 'cgc-9-4-nm' },
          { input: 'Spider-Man #1 CGC 9.2', expectedGrade: 'cgc-9-2-nm' },
          { input: 'Spider-Man #1 CGC 9.0', expectedGrade: 'cgc-9-0-vf-nm' },
          { input: 'Spider-Man #1 CGC 8.5', expectedGrade: 'cgc-8-5-vf' },
        ];

        testCases.forEach(({ input, expectedGrade }) => {
          const result = parseNormalizedTitle(input);
          expect(result.grade).toBe(expectedGrade);
          expect(result.confidence).toBeGreaterThan(0.8);
        });
      });

      it('should correctly identify raw grades', () => {
        const testCases = [
          { input: 'Spider-Man #1 NM', expectedGrade: 'raw-nm' },
          { input: 'Spider-Man #1 Near Mint', expectedGrade: 'raw-nm' },
          { input: 'Spider-Man #1 VF-NM', expectedGrade: 'raw-vf-nm' },
          { input: 'Spider-Man #1 Very Fine Near Mint', expectedGrade: 'raw-vf-nm' },
          { input: 'Spider-Man #1 VF', expectedGrade: 'raw-vf' },
          { input: 'Spider-Man #1 Very Fine', expectedGrade: 'raw-vf' },
          { input: 'Spider-Man #1 FN', expectedGrade: 'raw-fn' },
          { input: 'Spider-Man #1 Fine', expectedGrade: 'raw-fn' },
          { input: 'Spider-Man #1 VG', expectedGrade: 'raw-vg' },
          { input: 'Spider-Man #1 Very Good', expectedGrade: 'raw-vg' },
          { input: 'Spider-Man #1 GD', expectedGrade: 'raw-gd' },
          { input: 'Spider-Man #1 Good', expectedGrade: 'raw-gd' },
          { input: 'Spider-Man #1 FR', expectedGrade: 'raw-fr' },
          { input: 'Spider-Man #1 Fair', expectedGrade: 'raw-fr' },
          { input: 'Spider-Man #1 PR', expectedGrade: 'raw-pr' },
          { input: 'Spider-Man #1 Poor', expectedGrade: 'raw-pr' },
          { input: 'Spider-Man #1 Raw', expectedGrade: 'raw-nm' },
          { input: 'Spider-Man #1 Ungraded', expectedGrade: 'raw-nm' },
        ];

        testCases.forEach(({ input, expectedGrade }) => {
          const result = parseNormalizedTitle(input);
          expect(result.grade).toBe(expectedGrade);
        });
      });
    });

    describe('Real world messy titles', () => {
      it('should handle complex real-world title variations', () => {
        const messyTitles = [
          // CGC variations
          'Amazing Spider-Man #300 CGC 9.8 (1988)',
          'ASM 300 cgc 9.8 newsstand',
          'AMAZING SPIDER-MAN #300 CGC GRADED 9.8 NM/MT',
          'Amazing Spider-Man Vol 1 #300 CGC 9.8',
          
          // Raw variations
          'Batman #181 Raw NM First Robin',
          'BATMAN 181 nm raw 1st app robin',
          'Batman (1940) #181 Near Mint condition',
          'Batman Issue 181 Raw NM- First appearance Robin',
          
          // Mixed case and spacing
          'X-Men#1CGC9.6',
          'x-men #1 cgc 9.6',
          'X - Men # 1 CGC 9.6',
          'The X-Men #1 (1963) CGC 9.6',
          
          // Publisher variations
          'Marvel Amazing Spider-Man #300 CGC 9.8',
          'DC Batman #181 Raw NM',
          
          // Key issues
          'Fantastic Four #1 (1961) CGC 9.2 Origin & 1st App',
          'FF #1 cgc 9.2 first fantastic four',
          'Iron Man #1 (1968) Raw VF First Solo Title',
          'The Iron Man #1 raw vf-nm',
          
          // Variant covers
          'Amazing Spider-Man #300 CGC 9.8 Direct Edition',
          'ASM #300 cgc 9.8 newsstand variant',
          'Spider-Man #1 (1990) CGC 9.8 Gold Cover',
          'Spider-Man #1 cgc 9.8 silver edition',
          
          // Annual/Special issues
          'Amazing Spider-Man Annual #1 CGC 9.4',
          'ASM Annual 1 cgc 9.4',
          'Spider-Man Special #1 Raw NM',
          'Fantastic Four Special #1 cgc 9.0',
          
          // Series with numbers in title
          'Fantastic Four #1 CGC 9.8',
          'X-Men #1 Raw NM',
          'Avengers #4 CGC 9.6',
          
          // Different numbering systems
          'Amazing Spider-Man #1 (1963) CGC 9.8',
          'Amazing Spider-Man #1 (1999) Raw NM',
          'Amazing Spider-Man Vol 2 #1 CGC 9.8',
          'Amazing Spider-Man Volume 1 #300 Raw VF',
          
          // Missing grade info
          'Amazing Spider-Man #300',
          'Batman #181',
          'X-Men #1',
          
          // Missing issue info
          'Amazing Spider-Man CGC 9.8',
          'Batman Raw NM',
          'X-Men',
          
          // Complex descriptions
          'Amazing Spider-Man #300 CGC 9.8 White pages, Direct Market Edition',
          'Batman #181 Raw NM+ First Robin, Dick Grayson',
          'X-Men #1 CGC 9.6 SS Stan Lee Origin & 1st X-Men',
          'Fantastic Four #1 CGC 9.2 Stan Lee Jack Kirby',
          'Iron Man #1 Raw VF-NM First Solo Iron Man Comic',
          'Thor #337 Raw VF+ 1st Beta Ray Bill',
          'Hulk #181 CGC 9.4 1st Wolverine',
          'Avengers #4 Raw FN 1st Silver Age Captain America',
          'Detective Comics #27 CGC 8.5 First Batman',
          'Action Comics #1 Raw GD Superman 1st appearance',
          'Captain America #100 Raw VG+ First Issue',
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
          const result = parseNormalizedTitle(title);
          
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
        ];

        edgeCases.forEach(input => {
          const result = parseNormalizedTitle(input);
          expect(result).toBeDefined();
          expect(result.confidence).toBeLessThan(0.4);
        });
      });

      it('should handle unknown series with low confidence', () => {
        const result = parseNormalizedTitle('Unknown Series #1');
        expect(result).toBeDefined();
        expect(result.confidence).toBeLessThan(0.7); // More reasonable threshold
        expect(result.seriesId).toBe('unknown-series-unknown-year');
        expect(result.issueNumber).toBe('1');
      });

      it('should return default values for low confidence matches', () => {
        const result = parseNormalizedTitle('completely unrelated text');
        
        expect(result.seriesId).toBe('unknown');
        expect(result.issueNumber).toBe('1');
        expect(result.grade).toBe('raw-nm');
        expect(result.confidence).toBeLessThan(0.4);
        expect(result.notes).toContain('Low confidence parse');
      });

      it('should handle partial matches with appropriate confidence', () => {
        const partialMatches = [
          'Spider-Man', // Series only
          '#300 CGC 9.8', // Issue and grade only  
          'Amazing Spider-Man CGC 9.8', // Series and grade only
          'Amazing Spider-Man #300', // Series and issue only
        ];

        partialMatches.forEach(input => {
          const result = parseNormalizedTitle(input);
          expect(result.confidence).toBeGreaterThan(0);
          expect(result.confidence).toBeLessThan(1);
        });
      });
    });
  });

  describe('Exported constants', () => {
    it('should have comprehensive series aliases', () => {
      expect(Object.keys(SERIES_ALIASES).length).toBeGreaterThan(10);
      
      // Check key aliases
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

  describe('Backward compatibility - parseTitle', () => {
    it('should maintain compatibility with existing TopDeals code', () => {
      const testCases = [
        {
          input: 'Amazing Spider-Man #300 CGC 9.8',
          expectedSeries: 'asm',
          expectedIssue: '300',
        },
        {
          input: 'Batman #181 CGC 9.4', 
          expectedSeries: 'batman',
          expectedIssue: '181',
        },
        {
          input: 'X-Men #1 Raw NM',
          expectedSeries: 'x-men',
          expectedIssue: '1',
        },
      ];

      testCases.forEach(({ input, expectedSeries, expectedIssue }) => {
        const result = parseTitle(input);
        expect(result.series).toBe(expectedSeries);
        expect(result.issueNumber).toBe(expectedIssue);
        expect(result).toHaveProperty('variant');
      });
    });
  });
});