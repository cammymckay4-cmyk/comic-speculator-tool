# Architecture Overview

## System Design and Objectives

ComicScout UK is designed as a modular platform that ingests raw comic book listings, normalises their metadata, computes fair market values and deal scores, and exposes this information through a user ‑friendly web interface and API. The goal of the refactor is to evolve the existing prototype into a production ‑ready system with clear separation of concerns and scalable components.

## Domain Boundaries

The system is divided into several bounded contexts following domain ‑driven design:

- **Data Ingestion** – Handles integration with external data sources such as eBay, GoCollect and community feeds. Responsible for fetching and updating raw listings and sale data. Uses cron jobs and webhooks for scheduling.
- **Normalisation & Parsing** – Parses raw titles and descriptions to extract structured fields like series, issue, grade and special attributes. Normalises series aliases using a dictionary and heuristics. Provides a clean record for valuation.
- **Valuation & Analytics** – Calculates market values using historical sale data (mean, median, min, max, standard deviation). Computes deal scores (percentage savings) and ranking metrics. Supports configurable thresholds and weighting functions.
- **Alerts & Notifications** – Evaluates user‑defined rules and sends alerts via email using services like Resend. Supports scheduling and rate limiting.
- **API & Backend Services** – Exposes REST and GraphQL endpoints for front‑end consumption and third‑party integrations. Contains authentication, authorisation and business rules.
- **Frontend Application** – A responsive React/Next.js client that displays top deals, price trends and user alerts. Interacts with the API via client libraries.
- **Database Layer** – Centralised data storage built on PostgreSQL (via Supabase) with row‑level security. Stores series, issues, grades, listings, market values, deals, users and alerts.

## Data Flow and Interaction

1. **Ingestion → Normalisation:** The ingestion service collects raw listings and forwards them to the normalisation service via an internal queue. Normalised records are stored in a canonical format with consistent series, issue and grade details.
2. **Normalisation → Valuation:** The valuation service retrieves normalised records and historical sale data from the database to compute fair market values and deal scores. The results are written back to the database.
3. **Valuation → Alerts:** When valuations and deals are updated, an events stream triggers the alert evaluation service to check user‑defined rules. Alerts are queued for notification delivery.
4. **API → Frontend:** The API layer exposes endpoints for retrieving listings, deals and valuations. The front‑end application calls these endpoints to render the user interface.

## Draft Database Schema

- `series` — id, title, publisher.
- `issues` — id, series_id, number, name, variant, release_date, etc.
- `grades` — id, grade_code, description.
- `listings_raw` — id, source, title, raw_data, created_at.
- `listings` — id, series_id, issue_id, grade_id, price, seller_id, listing_url, etc.
- `sales` — id, listing_id, sold_price, sold_date.
- `market_values` — id, issue_id, grade_id, avg, min, max, stddev, updated_at.
- `deal_scores` — id, listing_id, score, savings_percent, rank, updated_at.
- `users` — id, email, hashed_password, preferences.
- `alerts` — id, user_id, issue_id, grade_id, threshold, created_at.

## External Integrations

- **eBay API** – For retrieving current listings and sale transactions.
- **GoCollect** – For price guide and sale data.
- **Supabase** – Database storage, authentication and row‑level security.
- **Resend** – Email notification service.

## Design Principles

- **Modularity & Maintainability:** Each bounded context is decoupled and can evolve independently, enabling easier testing and deployment.
- **Scalability:** Use asynchronous queues and event streams to decouple compute‑intensive tasks. Support horizontal scaling of ingestion and valuation workers.
- **Security:** Employ Supabase row‑level security for multi‑tenancy. Use environment variables for API credentials and secrets.
- **Observability:** Incorporate logging, metrics and tracing to monitor service health and performance.
