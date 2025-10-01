# 🚀 BoomScore AI - Production Sports Platform

**BoomScore.ai** is an enterprise-grade sports data platform powered by GPT-5 AI, delivering real-time match predictions, intelligent chat interactions, and comprehensive sports analytics.

## 🏗️ Architecture Design

### System Architecture

```mermaid
graph TB
    %% Client Layer
    Client[🌐 Client Applications<br/>Next.js Frontend<br/>Mobile Apps]
    
    %% API Gateway Layer
    GraphQL[📊 GraphQL API<br/>Apollo Server v4<br/>Real-time Subscriptions]
    REST[🔗 REST Endpoints<br/>Webhooks<br/>Health Checks]
    
    %% Core Services Layer
    subgraph "🧠 Core Services"
        Auth[🔐 Authentication Service<br/>JWT + Refresh Tokens<br/>Device Management]
        Chat[💬 AI Chat Service<br/>GPT-5 Integration<br/>Tool Planning]
        Predictions[🎯 Predictions Service<br/>AI-Powered Analysis<br/>Bulk Processing]
        Sports[⚽ Sports Service<br/>Multi-Sport Support<br/>Real-time Data]
        Payments[💳 Payments Service<br/>Paystack Integration<br/>Subscriptions]
    end
    
    %% Background Processing
    subgraph "⚙️ Background Jobs"
        Queue[📋 BullMQ Queues<br/>Job Processing<br/>Retry Logic]
        Workers[👷 Workers<br/>Data Ingestion<br/>Bulk Predictions]
        Scheduler[⏰ Scheduler<br/>Cron Jobs<br/>Auto-sync]
    end
    
    %% External Services
    subgraph "🌐 External APIs"
        OpenAI[🤖 OpenAI GPT-5<br/>AI Predictions<br/>Chat Responses]
        APISports[⚽ API-Sports<br/>Multi-Sport Data<br/>Real-time Updates]
        Paystack[💳 Paystack<br/>Nigerian Payments<br/>Subscriptions]
    end
    
    %% Data Layer
    subgraph "💾 Data Layer"
        PostgreSQL[(🐘 PostgreSQL<br/>Primary Database<br/>ACID Compliance)]
        Redis[(🔴 Redis<br/>Caching Layer<br/>Session Storage)]
    end
    
    %% Observability
    subgraph "📊 Observability"
        Logs[📝 Structured Logs<br/>Pino Logger<br/>Request Tracing]
        Metrics[📈 Metrics<br/>Prometheus<br/>Custom Metrics]
        Health[❤️ Health Checks<br/>Service Status<br/>Dependency Monitoring]
    end
    
    %% Connections
    Client --> GraphQL
    Client --> REST
    
    GraphQL --> Auth
    GraphQL --> Chat
    GraphQL --> Predictions
    GraphQL --> Sports
    GraphQL --> Payments
    
    REST --> Health
    REST --> Payments
    
    Chat --> OpenAI
    Predictions --> OpenAI
    Sports --> APISports
    Payments --> Paystack
    
    Auth --> PostgreSQL
    Chat --> PostgreSQL
    Predictions --> PostgreSQL
    Sports --> PostgreSQL
    Payments --> PostgreSQL
    
    Queue --> Workers
    Scheduler --> Queue
    Workers --> APISports
    Workers --> OpenAI
    
    Auth --> Redis
    Chat --> Redis
    Queue --> Redis
    
    GraphQL --> Logs
    REST --> Logs
    Queue --> Metrics
    Workers --> Health
```

### Technology Stack

#### 🚀 **Core Framework**
- **NestJS v11** - Enterprise Node.js framework
- **TypeScript** - Type-safe development
- **GraphQL + Apollo v4** - Modern API layer

#### 🤖 **AI & ML**
- **GPT-5** - Latest OpenAI model for predictions & chat
- **Custom Prompt Engineering** - Optimized sports analysis
- **Function Calling** - Tool-assisted responses

#### 📊 **Data & Storage**
- **PostgreSQL** - Primary database with ACID compliance
- **TypeORM v0.3.x** - Advanced ORM with migrations
- **Redis** - High-performance caching & sessions

#### ⚙️ **Background Processing**
- **BullMQ** - Reliable job queues & workers
- **Node-Cron** - Scheduled data synchronization
- **Rate Limiting** - API-Sports request management

#### 🔐 **Security & Auth**
- **JWT Access/Refresh Tokens** - Secure authentication
- **Device Fingerprinting** - Multi-device management
- **Role-based Access Control** - USER/MODERATOR/ADMIN
- **Helmet + CORS** - Security headers & policies

#### 💳 **Payments**
- **Paystack** - Nigerian payment gateway
- **Subscription Management** - FREE/PRO/ULTRA tiers
- **Webhook Processing** - Real-time payment updates

#### 📈 **Observability**
- **Pino Structured Logging** - High-performance logging
- **OpenTelemetry** - Distributed tracing
- **Prometheus Metrics** - Custom application metrics
- **Health Checks** - Service & dependency monitoring

#### 🚀 **DevOps**
- **Docker & Docker Compose** - Containerized deployment
- **pnpm Workspaces** - Monorepo management
- **GitHub Actions** - CI/CD pipeline
- **Testcontainers** - Integration testing

## 🎯 API Entry Points

### GraphQL API
**Endpoint:** `http://localhost:4000/graphql`

#### 🔐 Authentication
```graphql
# Register new user
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    user { id email username subscriptionPlan }
  }
}

# Login user
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user { id email username subscriptionPlan }
  }
}
```

#### ⚽ Sports Data
```graphql
# Get sports (multi-sport support)
query GetSports {
  sports {
    id name slug description isActive
    leagues { id name country }
  }
}

# Get matches with filters
query GetMatches($filters: MatchFilters) {
  matches(
    date: "2025-10-01"
    leagueId: "league-123"
    isLive: false
    limit: 20
  ) {
    id homeTeam { name logo } awayTeam { name logo }
    league { name country } status date
    homeScore awayScore odds { home draw away }
  }
}

# Get live matches
query GetLiveMatches {
  liveMatches {
    id homeTeam { name } awayTeam { name }
    status minute homeScore awayScore
  }
}
```

#### 🎯 AI Predictions
```graphql
# Generate single match prediction
mutation GeneratePrediction($input: GeneratePredictionInput!) {
  generatePredictions(input: $input) {
    id type predictedOutcome confidence reasoning
    match { homeTeam { name } awayTeam { name } }
  }
}

# Bulk predictions for multiple matches
mutation GenerateBulkPredictions($input: BulkPredictionInput!) {
  generateBulkPredictions(input: $input) {
    id status totalMatches filters
    predictionTypes scenario
  }
}
```

#### 💬 AI Chat
```graphql
# Send chat message with GPT-5
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    userMessage { content role }
    assistantMessage { content role }
    conversation { id title }
  }
}

# Complex sports queries examples:
# "Can you find me all possible draw games today?"
# "Can you find me home/draw games with high certainty?"
# "Can you build me a 3-odds accumulator with 80%+ confidence?"
```

#### 💳 Payments & Subscriptions
```graphql
# Nigerian Paystack Integration
mutation InitiatePayment($input: PaymentInput!) {
  initiatePayment(input: $input) {
    payment { id amount currency status }
    paymentUrl
    reference
  }
}

# Check subscription status
query MySubscription {
  myActiveSubscription {
    plan status currentPeriodEnd
    billingCycle
  }
  
  subscriptionLimits {
    monthlyPredictions
    monthlyChatMessages
    advancedFeatures
  }
}
```

### REST API Endpoints

#### 🔗 **Webhooks**
```bash
# Paystack payment webhooks
POST /webhooks/paystack
Content-Type: application/json
X-Paystack-Signature: [signature]

# Webhook test endpoint
POST /webhooks/paystack/test
```

#### ❤️ **Health & Monitoring**
```bash
# Health check
GET /health
Response: { status: "ok", timestamp, uptime, version }

# Readiness check
GET /health/ready
Response: { ready: true, services: { database: "up", redis: "up" } }

# Prometheus metrics
GET /metrics
Response: [Prometheus format metrics]
```

## 🚀 Deployment & Setup

### Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/boomscore-ai.git
cd boomscore-ai

# Install dependencies
pnpm install

# Setup environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your API keys

# Start with Docker
docker-compose up -d

# Start development
pnpm start
```

### Environment Variables
```bash
# Core
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/boomscore

# AI Services
OPENAI_API_KEY=sk-...              # GPT-5 API Key
OPENAI_MODEL=gpt-5                 # Default to GPT-5

# Sports Data
SPORT_API_KEY=your-api-key         # API-Sports key
SPORT_API_BASE_URL=https://v3.football.api-sports.io

# Payments (Nigerian Market)
PAYSTACK_SECRET_KEY=sk_test_...    # Paystack secret
PAYSTACK_PUBLIC_KEY=pk_test_...    # Paystack public

# Security
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-key
```

## 📋 Subscription Plans

| Feature | 🆓 FREE | 💼 PRO | 🚀 ULTRA |
|---------|---------|---------|-----------|
| **Monthly Predictions** | 10 | 100 | Unlimited |
| **Chat Messages** | 50 | 500 | Unlimited |
| **GPT-5 Access** | ❌ | ✅ | ✅ |
| **Bulk Predictions** | ❌ | ✅ | ✅ |
| **Advanced Analytics** | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ |
| **Price (NGN)** | Free | ₦5,000/mo | ₦10,000/mo |

## 🌟 Features

### 🎯 AI-Powered Predictions
- **GPT-5 Analysis** - Latest OpenAI model for maximum accuracy
- **Multi-Sport Support** - Football, Basketball, Hockey, Baseball, etc.
- **Confidence Scoring** - Transparent probability assessments
- **Detailed Reasoning** - Understand the AI's decision process
- **Bulk Processing** - Generate hundreds of predictions efficiently

### 💬 Intelligent Chat Interface
- **Natural Language Queries** - Ask complex sports questions
- **Tool Integration** - Chat can access live data and generate predictions
- **Custom System Prompts** - Personalized AI behavior
- **Multi-step Planning** - Handle complex multi-part queries

### ⚽ Comprehensive Sports Data
- **Real-time Updates** - Live scores, events, and statistics
- **Multi-Sport Coverage** - Beyond just football
- **Historical Data** - Seasons of match history
- **Team Analytics** - Form, head-to-head, home/away performance

### 💳 Nigerian Payment Integration
- **Paystack Gateway** - Optimized for Nigerian users
- **Multiple Payment Methods** - Cards, bank transfers, USSD
- **Subscription Management** - Automatic renewals and upgrades
- **Webhook Security** - Verified payment confirmations

### 🔐 Enterprise Security
- **JWT Authentication** - Secure token-based access
- **Device Management** - Track and manage user devices
- **Role-Based Access** - Admin, moderator, and user roles
- **Rate Limiting** - Protect against abuse

### 📊 Production Observability
- **Structured Logging** - Searchable, contextual logs
- **Distributed Tracing** - Track requests across services
- **Custom Metrics** - Business and technical KPIs
- **Health Monitoring** - Service dependency checks

## 🏃‍♂️ Quick Start Examples

### Complex Sports Queries
The AI chat can handle sophisticated requests:

```bash
# Natural language prediction requests
"Can you find me all possible draw games today?"
"Show me home win games with 80%+ confidence"
"Build me a 3-odds accumulator for Premier League"
"What are the best over 2.5 goals bets this weekend?"

# Real-time data queries
"What's the current score in the Liverpool vs Arsenal match?"
"Show me all live games with goals scored in the last 10 minutes"
"Which teams are performing best at home this season?"
```

### API Usage Examples
```javascript
// Generate predictions for a specific match
const prediction = await client.mutate({
  mutation: GENERATE_PREDICTION,
  variables: {
    input: {
      matchId: "match-123",
      predictionTypes: ["MATCH_RESULT", "BOTH_TEAMS_SCORE", "OVER_UNDER"],
      scenario: "Consider recent form and head-to-head record",
      includeReasoning: true
    }
  }
});

// Bulk predictions for today's matches
const bulk = await client.mutate({
  mutation: GENERATE_BULK_PREDICTIONS,
  variables: {
    input: {
      filters: {
        dateFrom: "2025-10-01",
        dateTo: "2025-10-01",
        leagueIds: ["premier-league", "la-liga"],
        excludeStarted: true
      },
      predictionTypes: ["MATCH_RESULT"],
      scenario: "Focus on value bets with 70%+ confidence"
    }
  }
});
```

## 📈 Performance & Scale

- **High Throughput** - Handle 1000+ concurrent users
- **Fast Response Times** - < 100ms for cached queries
- **Efficient Caching** - Redis-powered data layer
- **Background Processing** - Non-blocking bulk operations
- **Rate Limiting** - Respect external API limits
- **Horizontal Scaling** - Stateless service design

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Nigerian sports betting community**

*Powered by GPT-5 • Built with NestJS • Deployed on Digital Ocean*

**🌐 Website:** [boomscore.ai](https://boomscore.ai)  
**📧 Support:** support@boomscore.ai  
**🐦 Twitter:** [@BoomScoreAI](https://twitter.com/BoomScoreAI)