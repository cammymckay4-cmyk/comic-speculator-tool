# ComicScoutUK

The Essential Digital Tool for UK Comic Collectors and Speculators

ComicScoutUK is a comprehensive platform that combines personal collection management with powerful, data-driven market analysis and live eBay integration. Designed specifically for the UK market, it provides collectors with the fastest, most direct way to find, track, and be notified about specific comics for sale.

## 🎯 Vision & Mission

**Vision:** To be the essential digital tool for UK comic collectors and speculators, combining personal collection management with powerful, data-driven market analysis and live eBay integration.

**Core Mission:** To fill a clear gap in the UK market by providing collectors with the fastest, most direct way to find, track, and be notified about specific comics for sale on eBay.

**Unique Selling Proposition:** A powerful scouting tool that provides proactive, real-time alerts and ranks eBay listings by "best deal," eliminating the need for constant manual searching.

## 🎨 Design System

ComicScoutUK features a distinctive comic book-inspired design with a carefully crafted color palette and typography:

### Color Palette
- **Parchment** (#FDF6E3) - Background color reminiscent of aged comic pages
- **Ink Black** (#1C1C1C) - Primary text and borders
- **Stan Lee Blue** (#003049) - Primary navigation and headings
- **Kirby Red** (#D62828) - Accent color for warnings and highlights
- **Golden Age Yellow** (#F7B538) - Interactive elements and buttons

### Typography
- **Headings:** "Fruktur" - Comic book style serif font for headings and titles
- **Body Text:** "Inter" - Clean, readable sans-serif for body content

### Comic Book Styling Features
- Bold black borders with drop shadows
- Comic panel-style layouts
- Halftone pattern overlays
- Speech bubble-inspired tooltips
- Vintage comic book color schemes

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cammymckay4-cmyk/comic-speculator-tool.git
   cd comic-speculator-tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8080`

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing & Quality
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Open test UI
- `npm run lint` - Run ESLint

### Deployment
- `npm run deploy` - Deploy to GitHub Pages
- `npm run build && npm run deploy` - Build and deploy in one command

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ComicScoutUKApp.tsx    # Main application component
│   └── ui/                    # Shared UI components
├── styles/
│   └── globals.css           # Global styles and comic theme
├── App.tsx                   # Application entry point
└── main.tsx                  # Vite entry point

public/                       # Static assets
.github/
└── workflows/
    └── deploy.yml           # GitHub Actions deployment
```

## ✨ Core Features

### 📚 Collection Management ("Digital Comic Box")
- Add comics via database search or mobile barcode scanning
- Track purchase price, grade, grader, and personal photos
- View calculated profit/loss for each owned comic

### 🔍 The Scouting Engine & Alert System
- Continuous eBay API polling for new listings
- Deal Scoring Algorithm comparing prices to GoCollect Fair Market Value (FMV)
- Live, ranked "Scout Results" page showing best deals
- Configurable alerts for New Top Deals, Ending Soon listings, and Stale Listings
- "Sell Alerts" when owned comics surpass target market values

### 📊 Speculator Dashboard (Premium)
- Central hub for market analysis
- Total Collection Value tracking
- Value Over Time graphs
- Market Heat Index
- Speculation News Feed
- Advanced Collection Portfolio Analysis

### 👥 Social Features
- User profiles with privacy toggles
- Follow other users and view public collections
- Comic-specific comment threads (Premium)

### 🏆 Gamification
- PlayStation Trophy-style achievement system
- Collection Goals for series completion
- Example Trophies: "Full Series Owner," "Collection Value Exceeds £1,000"

## 🌐 Deployment

### Automatic Deployment (Recommended)
The project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Install dependencies
   - Run tests
   - Build the application
   - Deploy to GitHub Pages

### Manual Deployment
```bash
npm run build
npm run deploy
```

### GitHub Pages Setup

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

2. **Custom Domain (Optional):**
   - Add your custom domain in repository settings
   - Update the `cname` field in `.github/workflows/deploy.yml`

## 🔧 Technical Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom comic theme
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful icons
- **Recharts** - Charts and data visualization

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Fast unit testing
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🧪 Testing

The project includes comprehensive testing setup:

### Running Tests
```bash
# Run tests in watch mode
npm run test

# Run all tests once
npm run test:run

# Open test UI
npm run test:ui
```

### Test Structure
- Unit tests for components
- Integration tests for user flows
- Mock data for development and testing

## 🎯 Target Audience

### The Speculator/Investor
Needs robust market data, value trends, portfolio analysis, and "sell" alerts to maximize ROI

### The Dedicated Collector
Needs a powerful wishlist and alert system to find specific comics with grade requirements

### The Casual Hobbyist
Needs easy-to-use tools to catalogue their collection and explore the market

## 💰 Monetization

### Freemium Model with Three Tiers:

1. **Free** - Basic collection management
2. **Medium** - Enhanced features and alerts
3. **Pro** - Full Speculator Dashboard, Sell Alerts, Comment Threads, Scout Results

## 🛠️ Utilities

- **LCS (Local Comic Shop) Locator**
- **Missing Comic Request System**

## 📈 Enhanced Database Features

ComicScout UK features an enriched comic database with:

- **12,887 Marvel/DC series** with comprehensive metadata
- **2,905 Wikidata links** (22.5% coverage) for semantic web integration
- **External identifiers** for ComicVine and Grand Comics Database
- **Enhanced search** with series aliases and alternative names
- **Rich metadata** stored in JSONB format for flexible querying

### New API Endpoints
- `GET /api/series/enriched` - Get enriched series only
- `GET /api/search/enhanced?q=spider-man` - Search with alias support  
- `GET /api/stats/enrichment` - View enrichment statistics

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=your_database_url

# API Keys
EBAY_API_KEY=your_ebay_api_key
GOCOLLECT_API_KEY=your_gocollect_api_key
RESEND_API_KEY=your_resend_api_key

# Authentication
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Component Overview

### ComicScoutUKApp
The main application component featuring:
- **5 Complete Pages:** Home, Collection, Comic Detail, Alerts, Account Hub
- **Interactive Components:** Search, filters, pagination, modals
- **Responsive Navigation:** Desktop and mobile-optimized
- **Comic Card Layouts:** Grid and list view options
- **Form Components:** With validation and error handling
- **Loading States:** Smooth animations and transitions

### Page Components
- **HomePage:** Search and browse comics with filtering
- **CollectionPage:** Manage owned comics and wishlist
- **ComicDetailPage:** Detailed comic information and market data
- **AlertsPage:** Configure and manage price alerts
- **AccountHubPage:** User profile, trophies, and settings

## 🤝 Contributing

This project is currently in active development. Contribution guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 External Compliance

All features displaying market listings link directly back to eBay to ensure full compliance with eBay's Terms of Service.

## 📞 Support

For support and feedback:
- Open an issue on GitHub
- Join our Discord community
- Email: support@comicscoutuk.com

---

**Project Status:** 🚧 Active Development
**Version:** 2.0.0 (ComicScoutUK Frontend)
**Last Updated:** August 2025

Built with ❤️ for the UK comic collecting community