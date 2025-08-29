# ComicScout UK – Comic Scouting Engine

## Overview
ComicScout UK is an end-to-end platform for discovering undervalued comic books in the UK market. It scrapes and normalizes listings from sources like eBay, collects historic sales data from GoCollect, calculates market values using advanced statistics, and surfaces the best deals to collectors and investors. Alert rules allow users to be notified about new deals matching their criteria, and the platform exposes a REST API for integration with other services.

## Current status
This project is transitioning from a prototype based on mock data to a production-ready system. The current codebase includes a React front‑end using fixture data for demonstration. Upcoming phases include cleaning up the existing code, migrating data models to a relational database (PostgreSQL via Supabase), building a backend API with proper authentication, integrating real data sources, and refactoring the front‑end to consume the API.

rchitecture overv

##  overview

The ComicScout platform will follow a modular architecture with the following components:

- **Frontend:** A React + TypeScript single-page application using Vite, Tailwind CSS and shadcn/ui. It consumes the REST API for data and displays top deals, price charts and alerts. The codebase is structured by features with reusable UI components and hooks.
- **API server:** A backend written in Node.js using Express or Fastify. It exposes REST endpoints for top deals, listings, market data, notifications and user management. It integrates with the database, caching layer and external services. The API will be secured with JWT-based authentication and RBAC.
- **Database:** PostgreSQL provided by Supabase. Tables will store series, issues, listings, grades, market values, deals, users and alerts. The database schema is managed via SQL migrations and row-level security policies to enforce user access control.
- **Data ingestion & normalisation:** A separate scraping and normalisation engine written in TypeScript or Python. It fetches listings from marketplaces like eBay and sales data from GoCollect, normalises titles and grades, calculates market values and sends new deals to the API.
- **Background workers:** Jobs handle tasks such as scheduled scraping, market value recalculation, alert dispatch and email sending.

These components communicate via HTTP APIs and share a common codebase structure. The design prioritises separation of concerns, scalability and testability.


## Key features

- **Deal discovery:** Analyse current listings, compare them to historic sales and surface undervalued comic books with high savings.
- **Price charts & analytics:** Provide interactive charts of historic sales, market value trends and statistics for each comic.
- **Advanced search & filters:** Allow users to search by title, issue, grade, price range and sort by savings, time left and popularity.
- **Alerts & notifications:** Let users create alert rules based on series, issue and desired price or savings threshold and receive notifications via email.
- **Authentication:** Provide secure user registration and login with role-based access control to manage personal alerts and view purchase history.


## Technology stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router and React Query for data fetching.
- **Backend:** Node.js 20, Express or Fastify, Supabase client and PostgreSQL.
- **Database:** PostgreSQL with Supabase for hosting, real-time subscriptions and row-level security.
- **Data ingestion:** TypeScript or Python for scraping, with headless browsers and third-party API clients.
- **Testing:** Vitest and React Testing Library for front-end tests, Jest or Tap for back-end tests, ESLint and Prettier for linting/formatting.


## External integrations

The platform integrates with several external services:

- **eBay:** For current listing data via official APIs.
- **GoCollect:** For historic sales and market value calculations.
- **Resend:** For sending email notifications when alerts are triggered.
- **Supabase:** For database, authentication and real-time subscriptions.

Additional integrations like Twilio or Slack may be added for multi-channel notifications.

## Development phases

The project will progress through the following phases:

1. **Analysis & cleanup:** Audit the current codebase, remove unused code, unify formatting and prepare for modularisation.
2. **Database migration:** Design relational schema, migrate mock data to PostgreSQL via Supabase and implement row-level security.
3. **Backend development:** Build the REST API with endpoints for top deals, listings, market values, alerts and authentication.
4. **Frontend refactoring:** Update the front-end to consume the API, implement state management and restructure components by feature.
5. **Testing & integration:** Write comprehensive unit, integration and end-to-end tests, set up CI/CD and deploy to the chosen platform.
6. **Production hardening:** Address performance, caching, monitoring, logging and security before launch.

## Installation & setup

To run the project locally:

1. Clone this repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in your Supabase credentials, database URL and API keys for eBay, GoCollect and Resend.
4. Start the development server with `npm run dev`.
5. (Optional) Start the Supabase local development environment using `supabase start`.
6. Access the app at `http://localhost:5173` and the Supabase studio at `http://localhost:54322`.

For production deployment, build the front-end with `npm run build` and deploy the API server and database to your cloud of choice.

## Contributing

Contributions are welcome! Please:

- Fork the repository and create a feature branch.
- Write clear commits and follow conventional commit messages (`feat:`, `fix:`, `docs:`, etc.).
- Ensure new code is covered by tests and lints pass (`npm run test`).
- Submit a pull request describing the changes and referencing any relevant issues.

We use ESLint, Prettier and Husky for code quality; please run the pre-commit hooks before submitting.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
