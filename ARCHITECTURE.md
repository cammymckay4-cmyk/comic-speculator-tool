# Architecture Overview

## System Design and Objectives

ComicScout UK is designed as a modular platform that ingests raw comic book listings, normalises their metadata, computes fair market values and deal scores, and exposes this information through a user-friendly web interface and API. The goal of the refactor is to evolve the existing prototype into a production-ready system with clear separation of concerns and scalable components.

## Domain Boundaries

The system is divided into several bounded contexts following domain-driven design:

* **Data Ingestion**: Handles integration with external data sources such as eBay, GoCollect and community feeds. Responsible for fetching and updating raw listings and sale data. Uses cron jobs and webhooks for scheduling.
* **Normalisation & Parsing**: Parses raw titles and descriptions to extract structured fields like series, issue, grade and special attributes. Normalises series aliases using a dictionary and heuristics. Provides a clean record for valuation.
* **Valuation & Analytics**: Calculates market values using historical sale data (mean, median, min, max, standard deviation). Computes deal scores (percentage savings) and ranking metrics. Supports configurable thresholds and weighting functions.
* **Alerts & Notifications**: Evaluates user-defined rules and sends alerts via email using services like Resend. Supports scheduling and rate limiting.
* **API & Backend Services**: Exposes REST/GraphQL endpoints for front-end consumption and third-party integrations. Contains authentication, authorization and business rules.
* **Frontend Application**: A responsive React/Next.js client that visualises top deals, price trends and user alerts. Interacts with the API via client libraries.
* **Database Layer**: Centralised data storage built on PostgreSQL (via Supabase) with row-level security. Stores series, issues, grades, listings, market values, deals, users and alerts.

## Data Flow and Interaction

1. **Ingestion → Normalisation**: The ingestion service collects raw listings and forwards them to the normalisation service via an internal queue. Normalisation enriches each record with canonical identifiers and persists intermediate results.
2. **Normalisation → Valuation**: Once listings are normalised, the valuation service retrieves relevant sale history from the database, computes market value metrics and updates market_value and deal tables.
3. **Valuation → API**: Computed deals and market values are exposed through the API. The API supports filtering by series, issue number, grade and minimum score, and returns paginated results.
4. **Alerts**: Alert rules run periodically and query the latest deals. When a matching deal is found, the system sends an email notification to the user using the Resend API.
5. **Frontend**: The client fetches top deals from the API, displays them in tables or cards, and shows detailed charts powered by historical price data.

## API Design

The backend exposes a RESTful interface (with GraphQL planned) following these conventions:

* `/api/top-deals`: Returns a list of top deals with optional query parameters `minScore`, `series`, `issue`, `grade`, `limit`.
* `/api/listings`: Retrieves raw or normalised listings for debugging and auditing.
* `/api/market-values`: Provides aggregated market statistics for a given series, issue and grade.
* `/api/alerts`: CRUD endpoints for managing alert rules (protected with user auth).
* `/api/auth/*`: Handles user registration, login and session management using Supabase Auth or another provider.

All endpoints follow REST best practices with JSON responses, error codes and pagination. The system will adopt OpenAPI/Swagger documentation for discoverability.

## Database Strategy

We use a PostgreSQL database hosted via Supabase. Key tables include:

* `comic_series`, `issue`, `grade` – catalogue of canonical series, issues and grading tiers.
* `listing_raw`, `listing_normalised` – raw data ingested from sources and parsed/validated versions.
* `market_value` – computed statistics for each series/issue/grade combination.
* `deal` – the current top deals with pricing, scores and expiry.
* `users`, `alert_rule`, `user_alert` – user management and notification rules.

All database interactions use parameterised queries and RLS policies to ensure data security and multi-tenancy.

## Integration Patterns

External services are integrated via well-defined adapters. For real-time price data, the ingestion service calls eBay’s Finding API and GoCollect’s market data endpoints at scheduled intervals. Webhooks handle notifications from marketplaces. Long-running tasks (e.g., scraping large catalogues) are executed asynchronously using a job queue (e.g., Redis + BullMQ). The API communicates with Supabase via its client library and with Resend for email. All outbound requests include retry logic and backoff.

## Deployment & Hosting

During the refactor, we will adopt a multi-tier deployment:

* **Backend/API**: Deployed as a Node.js/Express service running on Bun or a container platform such as Fly.io or Vercel. It connects to the Supabase PostgreSQL database and caches using Redis or in-memory store. CI/CD will build and deploy this service automatically.
* **Frontend**: Built with Vite/React (transitioning to Next.js for SSR). Deployed to Vercel or Netlify for fast edge delivery. Uses environment variables to point to the API base URL.
* **Infrastructure**: Supabase hosts the database and provides authentication, storage and edge functions. Additional messaging and caching services (Redis, RabbitMQ) may run on managed services.

## Security and Compliance

Security is a first-class concern:

* **Authentication/Authorization**: Supabase Auth is used for user management, with JWT-based sessions and row-level security enforced in the database.
* **Secrets Management**: All API keys (eBay, GoCollect, Resend) and database credentials are stored in environment variables and secret managers. Example keys are provided in `.env.example` but never committed.
* **Validation & Sanitisation**: All user input and third-party data is validated and sanitised to prevent injection attacks.
* **Compliance**: The system adheres to GDPR and UK privacy regulations. Data retention policies are defined, and personal data is not stored unnecessarily.

## Scalability & Performance

The modular architecture allows independent scaling of services. The ingestion and normalisation services can be scaled horizontally to handle spikes in listings. Caching at the API layer reduces database load. Future improvements include background workers for analytics and the option to partition data by series or date to improve query performance. Monitoring and logging are integrated via tools like Sentry and Logflare.

## Development Phases & Maintainability

The refactor will be executed in phases (see `REFACTORING_PLAN.md`) to minimise disruption. Each component will have clear interfaces and tests to support future evolution. The codebase will adopt consistent TypeScript types, ESLint rules and Prettier formatting. Documentation will be maintained in this `ARCHITECTURE.md` file and synced with the API reference.
