# ComicScout UK

A modern comic collection management platform designed for UK collectors. Track your collection, manage wishlists, set price alerts, and monitor market values with a beautiful comic book-themed interface.

## Features

- **Comic collection management** - Organize and track your comic book collection
- **Search functionality** - Advanced search and filtering capabilities  
- **Wishlist tracking** - Keep track of comics you want to collect
- **Price alerts** - Get notified when comic values change
- **Market value tracking** (coming soon) - Real-time market data integration
- **User authentication** - Secure user accounts and profiles
- **Responsive design** - Works seamlessly on desktop and mobile
- **Comic book themed UI** - Unique vintage comic aesthetic

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom comic book theme
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cammymckay4-cmyk/comic-speculator-tool.git
cd comic-speculator-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Environment Variables

Required environment variables for the application:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run test suite with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run preview` - Preview production build
- `npm run gen:types` - Generate Supabase types

## Project Structure

```
comic-speculator-tool/
├── src/
│   ├── components/         # Reusable components
│   │   ├── features/      # Feature-specific components
│   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   └── ui/            # UI components
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── CollectionPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── ComicDetailPage.tsx
│   │   ├── AccountPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── NewsPage.tsx
│   ├── lib/               # Utilities and configurations
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   └── styles/            # Global styles
├── public/                # Static assets
├── supabase/              # Supabase configuration
└── ...config files
```

## Database Schema

The application uses Supabase with the following main tables:
- `comics` - Comic book information
- `user_collections` - User's collected comics
- `user_wishlists` - User's wishlist items
- `price_alerts` - User's price alert configurations

## Development Workflow

1. **Code Standards**:
   - TypeScript strict mode required
   - React functional components with hooks only
   - Database columns use snake_case
   - JavaScript/TypeScript use camelCase
   - All database operations through Supabase client

2. **Testing**:
   - Test all features both logged in and logged out
   - Verify redirects work correctly
   - Check for console errors before committing

3. **Database Operations**:
   - Primary keys are named 'id'
   - User IDs are UUIDs from auth.users table
   - Foreign keys reference auth.users, not public.users

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Production URL**: [ComicScout UK](https://comic-speculator-tool.vercel.app) *(Update with actual URL)*

### Manual Deployment

To deploy manually:
```bash
npm run build
```

The build artifacts will be generated in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is created for ComicScout UK. All rights reserved.

---

**Built with ❤️ for UK comic collectors**

POW! 💥 BAM! 💥 WHAM! 💥