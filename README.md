# ComicScout UK - Comic Deal Finder

A professional platform for finding the best comic book deals in the UK market. ComicScout analyzes market prices and identifies exceptional value opportunities for collectors and investors.

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control

### Get Started in 3 Steps

1. **Clone and Install**
   ```bash
   git clone https://github.com/cammymckay4-cmyk/comic-speculator-tool.git
   cd comic-speculator-tool
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:8080` to see the app running

### Verify Your Setup
```bash
# Run tests to ensure everything works
npm run test:run

# Check code quality
npm run lint

# Build for production
npm run build
```

## Features

- **Top Deals Dashboard**: Data-dense table showing the best comic deals with real-time savings calculations
- **Market Analysis**: Individual comic pages with price history charts and market value breakdowns  
- **Deal Alerts**: Set custom alerts for specific comics and deal thresholds
- **UK-Focused**: Prices in GBP with UK marketplace integration

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and builds
- **Styling**: Tailwind CSS with design system
- **Routing**: React Router for navigation
- **UI Components**: Shadcn/ui component library
- **Testing**: Vitest with React Testing Library
- **Code Quality**: ESLint with TypeScript support

## Usage Examples

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm run preview

# Run tests
npm run test        # Interactive test runner
npm run test:run    # Run once and exit
npm run test:ui     # Test UI interface
```

### Example API Usage

The app includes a Top Deals API for programmatic access:

```javascript
// Get top deals with default settings
const response = await fetch('/api/top-deals');
const data = await response.json();

// Get deals with custom filters
const filteredDeals = await fetch('/api/top-deals?minScore=25&searchTerms=Spider-Man,X-Men');
```

### Using the JavaScript Function Directly

```typescript
import { getTopDeals } from './src/lib/topDeals';

// Get top deals with defaults
const deals = await getTopDeals();

// Custom filtering
const highValueDeals = await getTopDeals(25, ['Amazing Spider-Man', 'X-Men']);

console.log(`Found ${deals.length} deals`);
deals.forEach(deal => {
  console.log(`${deal.listing.title}: ${deal.dealScore.score}% (£${deal.listing.totalPriceGBP})`);
});
```

## Project Structure

```
/public/          # Static assets
/src/
  /components/    # Reusable UI components
  /pages/         # Page components (Home, ItemDetail, Alerts)
  /lib/           # Utility functions and business logic
  /data/          # Mock data fixtures for development
  /hooks/         # Custom React hooks
  /__tests__/     # Test files
  /styles/        # CSS and design system
```

## Testing with Fixtures

ComicScout uses comprehensive fixture data for development and testing. The test data is located in `/src/data/fixtures.json` and includes:

### Fixture Data Structure

```json
{
  "series": [
    {
      "seriesId": "amazing-spider-man-1963",
      "title": "The Amazing Spider-Man",
      "publisher": "Marvel Comics", 
      "startYear": 1963,
      "aliases": ["asm", "amazing spider-man"]
    }
  ],
  "issues": [
    {
      "issueId": "amazing-spider-man-1963-300",
      "seriesId": "amazing-spider-man-1963",
      "issueNumber": "300",
      "keyNotes": "First appearance of Venom"
    }
  ],
  "grades": [...],
  "marketValues": [...],
  "listings": [...],
  "dealScores": [...]
}
```

### Using Fixtures in Tests

```typescript
// Example test using fixtures
import { describe, it, expect } from 'vitest';
import { parseTitle } from '../lib/normaliser';

describe('Title Parser', () => {
  it('should parse Amazing Spider-Man correctly', () => {
    const result = parseTitle('Amazing Spider-Man #300 CGC 9.8');
    expect(result.seriesId).toBe('amazing-spider-man-1963');
    expect(result.issueNumber).toBe('300');
    expect(result.grade).toBe('cgc-9-8-nm-mt');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI interface  
npm run test:ui

# Run tests once (for CI)
npm run test:run

# Run specific test file
npm run test normaliser
```

The fixture data includes:
- **Comic Series**: Amazing Spider-Man, Batman, X-Men, Fantastic Four, Iron Man
- **Key Issues**: First appearances, milestone issues with market data
- **Grading Systems**: CGC grades (9.8, 9.4, etc.) and raw conditions
- **Market Values**: Historical pricing data for value calculations
- **Deal Scores**: Sample scoring data for algorithm testing
- **Alert Rules**: Example alert configurations

**Important**: This is mock data for development and testing only. Production deployment would require real market data integration.

## Branching and PR Strategy

### Branch Naming Convention

- **Feature branches**: `feature/description-of-feature`
- **Bug fixes**: `bugfix/description-of-fix`
- **Hotfixes**: `hotfix/critical-issue-description`
- **Documentation**: `docs/description-of-changes`

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make Changes with Tests**
   - Write/update tests for your changes
   - Ensure all tests pass: `npm run test:run`
   - Check code quality: `npm run lint`
   - Verify build works: `npm run build`

3. **Commit Standards**
   ```bash
   # Use conventional commit format
   git commit -m "feat: add new deal scoring algorithm"
   git commit -m "fix: resolve parsing issue with variant covers"
   git commit -m "docs: update API documentation"
   ```

4. **Pull Request Guidelines**
   - **Title**: Clear, descriptive summary
   - **Description**: Include:
     - What changes were made and why
     - Testing performed
     - Screenshots for UI changes
     - Breaking changes (if any)
   - **Checklist**:
     - [ ] Tests pass (`npm run test:run`)
     - [ ] Code lints cleanly (`npm run lint`)
     - [ ] Build succeeds (`npm run build`)
     - [ ] Documentation updated if needed

### Code Review Process

- PRs require at least one reviewer
- All automated checks must pass
- Address feedback before merging
- Use "Squash and merge" for clean history

### Quality Gates

Before merging, ensure:
```bash
# All tests pass
npm run test:run

# No linting errors
npm run lint

# Successful build
npm run build

# Check for type errors
npx tsc --noEmit
```

## Application Pages

### Home Dashboard (`/`)
The main dashboard displaying top comic deals with:
- **Data Table**: Sortable deals with score, savings, and market data
- **Card View**: Visual layout for deal browsing
- **Filters**: Search and filter by series, grade, price range
- **Real-time Updates**: Live deal score calculations

### Item Detail (`/item/:issueId`)
Individual comic analysis page featuring:
- **Price History**: Interactive charts showing market trends
- **Grade Breakdown**: Market values across different grades
- **Current Listings**: Available deals for this issue
- **Key Information**: Issue significance and notes

### Alerts Management (`/alerts`)
Deal alert configuration interface with:
- **Alert Creation**: Set custom deal thresholds
- **Series Watching**: Monitor specific comic series
- **Notification Rules**: Configure alert delivery
- **Management Tools**: Edit, enable/disable, delete alerts

## Development Guidelines

- **Design System**: All colors defined in `src/index.css` and `tailwind.config.ts`
- **Components**: Use semantic design tokens instead of direct color values
- **UI Philosophy**: Maintain utilitarian, data-focused design approach
- **Information Density**: Prioritize clarity and data visibility over visual effects
- **TypeScript**: Follow strict type safety practices
- **Testing**: Write tests for new features and bug fixes
- **Performance**: Optimize for data-heavy interfaces

## Accessibility

ComicScout follows web accessibility standards:
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard Navigation**: Full keyboard accessibility support
- **High Contrast**: Readable design with sufficient color contrast
- **Screen Readers**: ARIA labels and descriptions where needed
- **Focus Management**: Clear focus indicators for interactive elements
- **Alternative Text**: Descriptive alt text for all images

## API Documentation

For detailed API usage, see [TOP_DEALS_API.md](./TOP_DEALS_API.md) which covers:
- REST endpoint documentation
- JavaScript function usage
- Deal score calculation methodology
- Data flow and caching strategies

## Contributing

We welcome contributions! Please:

1. Check existing issues before creating new ones
2. Follow the branching and PR strategy outlined above
3. Ensure all tests pass and code lints cleanly
4. Update documentation for new features
5. Add tests for bug fixes and new functionality

## Production Deployment

**Before deploying to production:**

1. Remove development dependencies:
   ```bash
   npm uninstall lovable-tagger
   ```

2. Set up environment variables for:
   - Real market data API keys
   - Database connections
   - Authentication services

3. Configure proper caching and rate limiting

4. Set up monitoring and error tracking

## License

MIT License - see LICENSE file for details.

---

**Development Note**: This application currently uses mock fixture data. Production deployment requires integration with real comic marketplace APIs and pricing services.