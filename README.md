# ComicScout UK — Comic Scouting Engine

## Vision and mission
ComicScout UK aims to democratise access to the UK comic book market by surfacing undervalued issues and hidden gems. By aggregating listings from multiple marketplaces, normalising data and providing real‑time market analytics, the platform empowers collectors and investors to make informed decisions.

## Overview
ComicScout is an end‑to‑end platform for discovering and tracking comic book deals. It scrapes listings from sources like eBay, collects historic sales data from GoCollect, calculates fair market values and trends, and sends notifications when interesting deals appear. Users can browse opportunities in a web UI or programmatically via a REST API. The system is built with a modern front‑end (React/TypeScript with shadcn/ui), a backend API written in Node.js, and a relational database managed via Supabase.

## Current status
This project is transitioning from a prototype based on mock data to a production‑ready application. The current codebase includes a basic React front‑end using fixture data for demonstration. Upcoming work includes:
- Cleaning up the existing code and removing obsolete prototype files.
- Migrating data models from TypeScript interfaces to a relational schema in PostgreSQL/Supabase.
- Building a backend API with proper authentication and RBAC.
- Integrating real eBay listing feeds and GoCollect sales data.
- Refactoring the front‑end to consume the API and support deal alerts.

## Key features
- **Deal discovery:** Analyse current listings, compare them to historic sales and fair values, and surface undervalued comic books with high savings.
- **Price charts & analytics:** Provide interactive charts of historic sales data, market value trends and statistics for each comic.
- **Price watch lists:** Allow users to create watch lists for specific titles, issues, grades or artists and get notified when matching deals appear.
- **Notifications & alerts:** Support configurable alert rules (price thresholds, percentage undervalue, timeframe, etc.) with delivery via email and in‑app notifications.
- **REST API:** Expose endpoints for querying deals, titles, issues, valuations and user alerts so other applications can integrate with ComicScout data.

## Target architecture
The ComicScout platform follows a modular architecture. Major components include:
- **Frontend:** A React/TypeScript single‑page application that consumes the REST API and displays top deals, alerts, price charts and user settings.
- **API server:** A Node.js backend (Express or Fastify) that exposes REST endpoints for deals, listings, valuations, titles, users and alerts. It handles authentication, authorisation and validation, and orchestrates communication with the database and background services.
- **Database:** A relational PostgreSQL database (managed by Supabase) storing users, titles, issues, listings, grades, valuations, alerts and notifications. Database schema changes are managed via SQL migrations.
- **Data ingestion & normalisation:** A separate scraping and normalisation service written in TypeScript or Python. It fetches listing data from marketplaces (eBay, etc.), historic sales from GoCollect, and normalises titles and grades to our canonical representation.
- **Background workers:** Jobs for tasks such as scheduled scraping, price calculations, alert dispatch and email sending.

Detailed diagrams and component boundaries can be found in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Contributing
We welcome contributions! Please read [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) to understand the current roadmap, then open an issue to discuss your proposed changes. When submitting a pull request, use descriptive branch names (e.g. `docs/initial-documentation` or `feat/api-endpoints`) and ensure that your changes are covered by appropriate tests. We adhere to the conventional commits specification for commit messages.
