ComicScoutUK Refactor Plan
Version: 1.0
Status: In Progress
Last Updated: August 2025
📋 Overview
This document outlines the comprehensive refactoring plan to transform the existing ComicScoutUK repository into a robust, market-ready application as defined in the Product Requirements Document (PRD) and Technical Specification.
🎯 Refactoring Objectives

Architecture Transformation: Convert to decoupled REST API backend
Database Migration: Update Supabase schema to support new features
Feature Implementation: Build core scouting, alert, and gamification systems
Code Quality: Establish modern TypeScript/Node.js best practices
Documentation: Create comprehensive technical documentation

🏗️ Target Architecture
Backend (REST API)

Framework: Node.js + Express + TypeScript
Database: PostgreSQL via Supabase
Authentication: Supabase Auth
External APIs: eBay, GoCollect, Resend
Response Format: JSON

Frontend

Type: Interchangeable client consuming REST API
Primary Implementation: Custom React application
Testing Frontend: Basic placeholder for API testing

External Integrations

eBay API: Live and sold listing data
GoCollect API: Fair Market Value (FMV) data
Resend API: Transactional emails (alerts, auth)

📊 Target Database Schema
Core Tables
Users
sqluser_id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
subscription_tier (ENUM: free, medium, pro)
profile_is_public (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
Comics
sqlcomic_id (UUID, PK)
title (VARCHAR)
issue_number (VARCHAR)
publisher (VARCHAR)
series_id (UUID, FK)
cover_image_url (VARCHAR)
created_at (TIMESTAMP)
User_Collection
sqlentry_id (UUID, PK)
user_id (UUID, FK)
comic_id (UUID, FK)
purchase_price (DECIMAL)
grade (VARCHAR)
grader (VARCHAR)
user_submitted_image_url (VARCHAR)
created_at (TIMESTAMP)
Wishlist_Items
sqlwant_id (UUID, PK)
user_id (UUID, FK)
comic_id (UUID, FK)
min_grade (VARCHAR)
must_be_graded (BOOLEAN)
grader_preference (VARCHAR)
created_at (TIMESTAMP)
Alert_Settings
sqlsetting_id (UUID, PK)
user_id (UUID, FK)
want_id (UUID, FK, NULLABLE) -- null for global settings
alert_type (ENUM: new_deal, ending_soon, stale_listing, sell_alert)
is_active (BOOLEAN)
threshold (JSONB) -- flexible threshold configuration
created_at (TIMESTAMP)
Trophies
sqltrophy_id (UUID, PK)
name (VARCHAR)
description (TEXT)
icon_url (VARCHAR)
tier (ENUM: bronze, silver, gold, platinum)
rules (JSONB) -- trophy earning conditions
User_Trophies
sqluser_trophy_id (UUID, PK)
user_id (UUID, FK)
trophy_id (UUID, FK)
earned_date (TIMESTAMP)
🔄 Refactoring Phases
Phase 1: Analysis & Cleanup ✅
Duration: 1-2 days
Status: Complete

 Repository analysis and current state assessment
 README.md update with project vision and status
 Remove obsolete planning files
 Create refactoring documentation
 Code audit and technical debt identification

Phase 2: Database Migration 🚧
Duration: 2-3 days
Status: Pending
Tasks:

 Generate migration scripts for new schema
 Backup existing Supabase data
 Execute schema transformation
 Create database utilities and helpers
 Validate data integrity post-migration

Key Deliverables:

Migration scripts (migrations/ directory)
Database utility functions
Updated Supabase client configuration

Phase 3: Core API Development
Duration: 5-7 days
Status: Pending
Tasks:

 Set up Express.js REST API structure
 Implement authentication endpoints
 Create CRUD operations for all entities
 Build external API clients (eBay, GoCollect)
 Implement error handling and validation

Key Deliverables:

Complete REST API (src/api/ directory)
API documentation
External service integrations

Phase 4: Scouting Engine Implementation
Duration: 4-5 days
Status: Pending
Tasks:

 Build eBay polling system
 Implement Deal Scoring Algorithm
 Create alert generation logic
 Set up scheduled jobs (cron)
 Build Scout Results ranking system

Key Deliverables:

Scouting engine (src/scouting/ directory)
Alert system
Background job scheduler

Phase 5: Gamification System
Duration: 3-4 days
Status: Pending
Tasks:

 Design trophy rule engine
 Implement achievement checking logic
 Create collection goal tracking
 Build trophy notification system

Key Deliverables:

Gamification engine (src/gamification/ directory)
Trophy definitions and rules
Achievement tracking system

Phase 6: Premium Features
Duration: 3-4 days
Status: Pending
Tasks:

 Implement subscription tier checking
 Build Speculator Dashboard data aggregation
 Create premium alert configurations
 Add comment system for comics

Key Deliverables:

Premium feature gates
Dashboard analytics
Advanced alert system

Phase 7: Testing & Quality Assurance
Duration: 3-4 days
Status: Pending
Tasks:

 Unit tests for core business logic
 Integration tests for API endpoints
 End-to-end testing scenarios
 Performance optimization
 Security audit

Key Deliverables:

Comprehensive test suite
Performance benchmarks
Security assessment report

Phase 8: Documentation & Polish
Duration: 2-3 days
Status: Pending
Tasks:

 Complete API documentation
 Developer setup guide
 Deployment instructions
 User guide documentation

Key Deliverables:

Complete technical documentation
Deployment guide
API reference

📈 Success Metrics
Technical Metrics

 100% API endpoint coverage
 >90% test coverage
 <500ms average API response time
 Zero critical security vulnerabilities

Functional Metrics

 Complete scouting engine functionality
 Real-time alert system operational
 All premium features implemented
 Gamification system fully functional

🚨 Risk Mitigation
High-Risk Areas

eBay API Integration - Rate limits and ToS compliance
Database Migration - Data loss prevention
Real-time Alerts - Scalability and reliability
External API Dependencies - Service availability

Mitigation Strategies

Comprehensive testing at each phase
Incremental rollout approach
Backup and rollback procedures
Monitoring and alerting systems

🔗 Dependencies
External Services

Supabase (Database + Auth)
eBay API access and credentials
GoCollect API access
Resend API for email delivery

Technical Dependencies

Node.js 18+ runtime environment
TypeScript development tools
Testing framework setup
CI/CD pipeline configuration

📞 Communication Plan
Progress Reporting

Daily: Phase progress updates
Weekly: Overall project status
Ad-hoc: Critical issue escalation

Decision Points

Architecture approval gates
Database migration go/no-go
Feature prioritization reviews
Launch readiness assessment


Next Phase: Database Migration
Estimated Completion: Q4 2025