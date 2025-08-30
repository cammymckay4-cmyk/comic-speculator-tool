# ComicScoutUK System Architecture
**Version:** 1.0  
**Last Updated:** August 2025

## 🏗️ Overview
ComicScoutUK follows a decoupled architecture pattern, separating concerns between data management, business logic, and presentation layers. This design ensures maximum flexibility, scalability, and maintainability.

## 🎯 Architectural Principles

### 1. Decoupled Design
* **Backend:** Standalone REST API handling all business logic
* **Frontend:** Interchangeable client applications
* **Database:** Managed PostgreSQL via Supabase
* **External Services:** Isolated integration points

### 2. API-First Approach
* All functionality exposed through REST endpoints
* JSON-based communication
* Comprehensive API documentation
* Version-controlled API contracts

### 3. Scalable Infrastructure
* Stateless backend services
* Database connection pooling
* Cacheable responses
* Horizontal scaling capability

### 4. Security by Design
* JWT-based authentication
* Role-based access control
* Input validation and sanitization
* Rate limiting and abuse prevention

## 🔧 Technology Stack

### Backend Services
┌─────────────────────────────────────────────────────────────────┐
│                          Backend API                          │
├─────────────────────────────────────────────────────────────────┤
│ • Runtime: Node.js 18+                                          │
│ • Language: TypeScript 5+                                       │
│ • Framework: Express.js                                         │
│ • Validation: Joi/Zod                                           │
│ • Authentication: Supabase Auth                                 │
│ • ORM: Supabase-js Client                                       │
└─────────────────────────────────────────────────────────────────┘


### Database Layer
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                         │
├─────────────────────────────────────────────────────────────────┤
│ • Database: PostgreSQL 15+                                      │
│ • Platform: Supabase                                            │
│ • Features: RLS, Real-time subscriptions, Auth integration      │
│ • Migrations: Supabase CLI                                      │
│ • Backup: Automated daily snapshots                             │
└─────────────────────────────────────────────────────────────────┘


### External Integrations
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                         │
├─────────────────────────────────────────────────────────────────┤
│ • eBay API: Trading & Finding APIs                              │
│ • GoCollect API: Fair Market Value data                         │
│ • Resend API: Transactional email delivery                      │
│ • Google Maps API: LCS location services                        │
└─────────────────────────────────────────────────────────────────┘


## 📊 System Components

### 1. API Gateway Layer
// Express.js application structure
app/
├── middleware/
│   ├── auth.ts          // JWT validation
│   ├── rateLimiter.ts   // Request rate limiting
│   ├── validator.ts     // Input validation
│   └── cors.ts          // CORS configuration
├── routes/
│   ├── auth.ts          // Authentication endpoints
│   ├── collection.ts    // Collection management
│   ├── wishlist.ts      // Wishlist operations
│   ├── scouting.ts      // Scout results & alerts
│   └── dashboard.ts     // Analytics & reporting
└── app.ts               // Express app configuration

2. Business Logic Layer
TypeScript

// Service layer organization
services/
├── auth/
│   ├── AuthService.ts           // User authentication
│   └── PermissionService.ts     // Authorization logic
├── collection/
│   ├── CollectionService.ts     // Collection management
│   └── WishlistService.ts       // Wishlist operations
├── scouting/
│   ├── ScoutingEngine.ts        // eBay polling system
│   ├── DealScorer.ts            // Deal ranking algorithm
│   └── AlertService.ts          // Alert generation
├── gamification/
│   ├── TrophyEngine.ts          // Achievement system
│   └── GoalTracker.ts           // Collection goals
└── external/
    ├── EbayClient.ts            // eBay API integration
    ├── GoCollectClient.ts       // Market data API
    └── ResendClient.ts          // Email service
    
3. Data Access Layer
TypeScript

// Database interaction layer
data/
├── models/
│   ├── User.ts              // User entity
│   ├── Comic.ts             // Comic entity
│   ├── Collection.ts        // User collection
│   ├── Wishlist.ts          // Wishlist items
│   ├── Alert.ts             // Alert settings
│   └── Trophy.ts            // Achievement system
├── repositories/
│   ├── UserRepository.ts    // User data operations
│   ├── ComicRepository.ts   // Comic data operations
│   └── CollectionRepository.ts
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_trophies.sql
    └── 003_alert_system.sql
    
🔄 Data Flow Architecture
1. Request Processing Flow
Code snippet

graph TD
    A[Client Request] --> B[API Gateway]
    B --> C[Authentication Middleware]
    C --> D[Validation Middleware]
    D --> E[Rate Limiting]
    E --> F[Route Handler]
    F --> G[Service Layer]
    G --> H[Data Repository]
    H --> I[Supabase Database]
    I --> H
    H --> G
    G --> F
    F --> J[JSON Response]
    J --> A
    
2. Scouting Engine Flow
Code snippet

graph TD
    A[Cron Scheduler] --> B[Scouting Engine]
    B --> C[Fetch Active Wishlists]
    C --> D[Query eBay API]
    D --> E[Match Listings to Wants]
    E --> F[Calculate Deal Scores]
    F --> G[Generate Alerts]
    G --> H[Send Notifications]
    H --> I[Update Alert History]
    
3. Alert System Flow
Code snippet

graph TD
    A[Alert Trigger] --> B[Alert Service]
    B --> C[Check User Preferences]
    C --> D[Validate Alert Conditions]
    D --> E[Generate Alert Message]
    E --> F[Queue Email Notification]
    F --> G[Send via Resend API]
    G --> H[Log Alert Delivery]
    
🗄️ Database Architecture
Entity Relationship Diagram
SQL

-- Core Entities
Users ||--o{ User_Collection : owns
Users ||--o{ Wishlist_Items : wants
Users ||--o{ Alert_Settings : configures
Users ||--o{ User_Trophies : earned

Comics ||--o{ User_Collection : collected
Comics ||--o{ Wishlist_Items : wanted

Trophies ||--o{ User_Trophies : awarded

-- Relationships
User_Collection }o--|| Comics : contains
Wishlist_Items }o--|| Comics : references
Alert_Settings }o--o| Wishlist_Items : monitors

Indexing Strategy
SQL

-- Performance-critical indexes
CREATE INDEX idx_user_collection_user_id ON User_Collection(user_id);
CREATE INDEX idx_wishlist_user_id ON Wishlist_Items(user_id);
CREATE INDEX idx_comics_title_issue ON Comics(title, issue_number);
CREATE INDEX idx_alert_settings_active ON Alert_Settings(is_active, user_id);

🔒 Security Architecture
Authentication Flow
User Registration/Login → Supabase Auth

JWT Token Generation → Supabase returns signed JWT

Request Authentication → Validate JWT on each API call

Authorization Check → Verify user permissions for resources

Security Layers
TypeScript

// Security middleware stack
app.use(helmet());               // Security headers
app.use(cors(corsOptions));      // CORS configuration
app.use(rateLimiter);            // Rate limiting
app.use(authMiddleware);         // JWT validation
app.use(rbacMiddleware);         // Role-based access control

Data Protection
Encryption at Rest: Supabase managed encryption

Encryption in Transit: HTTPS/TLS for all communications

Input Sanitization: Joi/Zod schema validation

SQL Injection Prevention: Parameterized queries via Supabase-js

📈 Scalability Considerations
Horizontal Scaling
Stateless API Design: No server-side session storage

Database Connection Pooling: Efficient connection management

Caching Strategy: Redis for frequently accessed data

CDN Integration: Static asset delivery optimization

Performance Optimization
Response Caching: HTTP cache headers for static data

Database Query Optimization: Indexed queries and query analysis

Background Job Processing: Queue-based alert processing

API Response Compression: Gzip compression for large responses


🔧 Development Environment
Local Setup Architecture
YAML

# Docker Compose Development Stack
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=comicscout_dev
    ports:
      - "5432:5432"
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
Testing Architecture
Unit Tests: Jest + TypeScript

Integration Tests: Supertest for API endpoints

Database Tests: Test database with migrations

E2E Tests: Playwright for full user scenarios

🚀 Deployment Architecture
Production Environment
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  API Instances  │    │    Database     │
│                 │────│                 │────│                 │
│  • SSL Term     │    │ • Node.js Apps  │    │ • Supabase      │
│  • Rate Limit   │    │ • Auto Scaling  │    │ • Backups       │
│  • Health Check │    │ • Health Checks │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
Monitoring & Observability
Application Metrics: Custom metrics for business KPIs

Error Tracking: Structured logging and error aggregation

Performance Monitoring: API response time tracking

Uptime Monitoring: Health check endpoints and alerts

🔄 Integration Patterns
External API Integration
TypeScript

// Circuit breaker pattern for external APIs
class EbayClient {
  private circuitBreaker = new CircuitBreaker(this.makeRequest, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  });

  async searchListings(query: SearchQuery): Promise<ListingResult[]> {
    return this.circuitBreaker.fire(query);
  }
}
Event-Driven Architecture
TypeScript

// Event system for decoupled components
enum EventType {
  COMIC_ADDED = 'comic.added',
  DEAL_FOUND = 'deal.found',
  TROPHY_EARNED = 'trophy.earned'
}

EventEmitter.on(EventType.COMIC_ADDED, async (event) => {
  await TrophyEngine.checkAchievements(event.userId);
});
📋 API Design Standards
RESTful Conventions
GET    /api/collection/{userId}           # Get user collection
POST   /api/collection                    # Add comic to collection
PUT    /api/collection/{entryId}          # Update collection entry
DELETE /api/collection/{entryId}          # Remove from collection

GET    /api/scout/{wantId}                # Get scout results
GET    /api/dashboard/{userId}            # Get dashboard data
POST   /api/alerts                        # Create alert setting
Response Format Standards
TypeScript

// Standardized API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
This architecture provides a solid foundation for building a scalable, maintainable, and secure comic collection and scouting platform that can grow with user demand and feature requirements.