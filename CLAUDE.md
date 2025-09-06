# Claude Code Guidelines for comic-speculator-tool

## Project Overview
Comic collection management platform with search, wishlist, alerts, and market value tracking for UK market.

## Tech Stack
- Frontend: React 18 + TypeScript + Vite
- Database: Supabase (PostgreSQL)
- Styling: Tailwind CSS with comic book theme
- Deployment: Vercel
- Auth: Supabase Auth
- State: Zustand stores

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run gen:types` - Generate Supabase types

## Code Standards
- TypeScript strict mode required
- React functional components with hooks only
- Database columns use snake_case
- JavaScript/TypeScript use camelCase
- All database operations through Supabase client
- Use existing UI components before creating new ones

## Database Notes
- Primary keys are named 'id' (not want_id, etc)
- User IDs are UUIDs from auth.users table
- Foreign keys reference auth.users, not public.users
- Market values will use GoCollect API

## Testing
- Test all features logged in AND logged out
- Verify redirects work correctly
- Check for console errors before committing