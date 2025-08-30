ComicScoutUK
The Essential Digital Tool for UK Comic Collectors and Speculators
ComicScoutUK is a comprehensive platform that combines personal collection management with powerful, data-driven market analysis and live eBay integration. Designed specifically for the UK market, it provides collectors with the fastest, most direct way to find, track, and be notified about specific comics for sale.
🎯 Vision & Mission
Vision: To be the essential digital tool for UK comic collectors and speculators, combining personal collection management with powerful, data-driven market analysis and live eBay integration.
Core Mission: To fill a clear gap in the UK market by providing collectors with the fastest, most direct way to find, track, and be notified about specific comics for sale on eBay.
Unique Selling Proposition: A powerful scouting tool that provides proactive, real-time alerts and ranks eBay listings by "best deal," eliminating the need for constant manual searching.
🏗️ Architecture
ComicScoutUK follows a decoupled architecture design:

Backend: Standalone REST API built with TypeScript and Node.js
Database: PostgreSQL via Supabase
Frontend: Interchangeable client (React-based custom frontend)
External APIs: eBay API, GoCollect API, Resend API

This architecture ensures the frontend is completely interchangeable, allowing custom-built frontends to replace any basic placeholder UI.
🎯 Target Audience

The Speculator/Investor: Needs robust market data, value trends, portfolio analysis, and "sell" alerts to maximize ROI
The Dedicated Collector: Needs a powerful wishlist and alert system to find specific comics with grade requirements
The Casual Hobbyist: Needs easy-to-use tools to catalogue their collection and explore the market

✨ Core Features
📚 Collection Management ("Digital Comic Box")

Add comics via database search or mobile barcode scanning
Track purchase price, grade, grader, and personal photos
View calculated profit/loss for each owned comic

🔍 The Scouting Engine & Alert System

Continuous eBay API polling for new listings
Deal Scoring Algorithm comparing prices to GoCollect Fair Market Value (FMV)
Live, ranked "Scout Results" page showing best deals
Configurable alerts for New Top Deals, Ending Soon listings, and Stale Listings
"Sell Alerts" when owned comics surpass target market values

📊 Speculator Dashboard (Premium)

Central hub for market analysis
Total Collection Value tracking
Value Over Time graphs
Market Heat Index
Speculation News Feed
Advanced Collection Portfolio Analysis

👥 Social Features

User profiles with privacy toggles
Follow other users and view public collections
Comic-specific comment threads (Premium)

🏆 Gamification

PlayStation Trophy-style achievement system
Collection Goals for series completion
Example Trophies: "Full Series Owner," "Collection Value Exceeds £1,000"

🛠️ Utilities

LCS (Local Comic Shop) Locator
Missing Comic Request System

💰 Monetization
Freemium Model with three tiers:

Free: Basic collection management
Medium: Enhanced features and alerts
Pro: Full Speculator Dashboard, Sell Alerts, Comment Threads, Scout Results

🚀 Development Status
This project is currently undergoing a major refactor to transform the existing codebase into a market-ready application. The refactoring process follows a structured, phase-based approach:
Current Phase: Analysis & Cleanup

Repository analysis and documentation updates
Obsolete file removal and code audit
Architecture planning and schema design

Upcoming Phases:

Database Migration - Transform existing Supabase schema
API Development - Build REST API endpoints
Core Feature Implementation - Scouting engine, alerts, gamification
Frontend Integration - Connect with custom React frontend
Testing & Polish - Comprehensive testing and optimization

🔧 Technical Stack

Backend: TypeScript, Node.js, Express
Database: PostgreSQL (Supabase)
APIs: eBay API, GoCollect API, Resend API
Frontend: React (custom implementation)
Authentication: Supabase Auth
Email: Resend API

📋 Getting Started
Note: Development setup instructions will be added as the refactor progresses.
🤝 Contributing
This project is currently in active refactoring. Contribution guidelines will be established once the core architecture is stable.
📄 License
License information to be determined.
🔗 External Compliance
All features displaying market listings link directly back to eBay to ensure full compliance with eBay's Terms of Service.

Project Status: 🚧 Under Active Refactoring
Version: 1.0 (Refactor in Progress)
Last Updated: August 2025
