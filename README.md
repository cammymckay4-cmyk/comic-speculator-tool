# ComicScout UK - Comic Deal Finder

A professional platform for finding the best comic book deals in the UK market. ComicScout analyzes market prices and identifies exceptional value opportunities for collectors and investors.

## Features

- **Top Deals Dashboard**: Data-dense table showing the best comic deals with real-time savings calculations
- **Market Analysis**: Individual comic pages with price history charts and market value breakdowns
- **Deal Alerts**: Set custom alerts for specific comics and deal thresholds
- **UK-Focused**: Prices in GBP with UK marketplace integration

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling and development
- Tailwind CSS for styling
- React Router for navigation
- Shadcn/ui component library

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd comicscout-uk
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:8080`

### Build for Production

```bash
npm run build
```

## Project Structure

```
/public/          # Static assets
/src/
  /components/    # Reusable UI components
  /pages/         # Page components (Home, ItemDetail, Alerts)
  /lib/           # Utility functions
  /data/          # Mock data fixtures
  /styles/        # CSS and design system
```

## Mock Data

This application uses fixture data located in `/src/data/fixtures.json` for demonstration purposes. The data includes:

- Comic series information (Amazing Spider-Man, Batman, X-Men)
- Individual issue details with key notes
- Grading information (CGC and raw grades)
- Market value calculations
- Deal scores and pricing analysis
- Sample alert rules

**Important**: This is mock data for development and demonstration only. Real market data integration would be required for production use.

## Accessibility

ComicScout follows web accessibility standards:
- Semantic HTML structure with proper headings
- Keyboard navigation support
- High contrast design for readability
- Screen reader compatibility
- Alt text for images
- Focus indicators for interactive elements

## Handoff Note

**After scaffolding**: Sync this project to GitHub and continue development in your local IDE. Remove the `lovable-tagger` dependency from package.json before deploying to production, as it's only needed for the Lovable development environment.

## Development Guidelines

- All colors are defined in the design system (`src/index.css` and `tailwind.config.ts`)
- Use semantic design tokens instead of direct color values
- Maintain the utilitarian, data-focused design approach
- Prioritize information density and clarity over visual polish
- Follow TypeScript best practices for type safety

## Pages

### Home (`/`)
Dashboard showing top comic deals with sortable data table and card views. Displays deal scores, savings calculations, and market comparisons.

### Item Detail (`/item/:issueId`)
Individual comic analysis page with:
- Price history visualization
- Market value breakdown by grade
- Current deal listings
- Key issue information

### Alerts (`/alerts`)
Alert management interface for:
- Creating custom deal alerts
- Setting deal score thresholds
- Managing active/inactive alerts
- Alert rule editing and deletion

## License

MIT License - see LICENSE file for details.