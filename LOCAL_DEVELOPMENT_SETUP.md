# Local Development Setup

## Overview

Complete local development environment using Docker Compose to replicate AWS services locally.

## Docker Compose Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Local Development                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Express    │  │   Postgres   │  │  LocalStack  │ │
│  │     API      │──│   (Aurora)   │  │     (SQS)    │ │
│  │  Port 3000   │  │  Port 5432   │  │  Port 4566   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Lambda     │  │   pgAdmin    │                    │
│  │   Worker     │  │  Port 5050   │                    │
│  │   (Local)    │  └──────────────┘                    │
│  └──────────────┘                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Docker Compose Configuration

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL (replaces Aurora)
  postgres:
    image: postgres:16-alpine
    container_name: scoutspark-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: scoutspark_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Database UI)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: scoutspark-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@scoutspark.local
      PGADMIN_DEFAULT_PASSWORD: admin
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - postgres

  # LocalStack (AWS services: SQS, SNS, etc.)
  localstack:
    image: localstack/localstack:latest
    container_name: scoutspark-localstack
    restart: unless-stopped
    environment:
      SERVICES: sqs,sns,secretsmanager
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
      DOCKER_HOST: unix:///var/run/docker.sock
    ports:
      - "4566:4566"  # LocalStack gateway
      - "4571:4571"  # LocalStack dashboard
    volumes:
      - localstack_data:/tmp/localstack
      - "/var/run/docker.sock:/var/run/docker.sock"
      - ./scripts/localstack-init.sh:/etc/localstack/init/ready.d/init.sh
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4566/_localstack/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Express API
  api:
    build:
      context: ./express-api
      dockerfile: Dockerfile.dev
    container_name: scoutspark-api
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/scoutspark_dev
      AWS_REGION: us-east-1
      AWS_ENDPOINT: http://localstack:4566
      QUEUE_URL: http://localstack:4566/000000000000/notifications-queue
      JWT_SECRET: local-dev-secret-key-min-32-chars
      LOG_LEVEL: debug
    ports:
      - "3000:3000"
      - "9229:9229"  # Node debugger
    volumes:
      - ./express-api/src:/app/src
      - ./express-api/prisma:/app/prisma
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      localstack:
        condition: service_healthy
    command: npm run dev

  # Lambda Worker (simulated locally)
  worker:
    build:
      context: ./lambda-workers
      dockerfile: Dockerfile.dev
    container_name: scoutspark-worker
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/scoutspark_dev
      AWS_REGION: us-east-1
      AWS_ENDPOINT: http://localstack:4566
      QUEUE_URL: http://localstack:4566/000000000000/notifications-queue
      LOG_LEVEL: debug
    volumes:
      - ./lambda-workers/src:/app/src
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      localstack:
        condition: service_healthy
    command: npm run dev:worker

volumes:
  postgres_data:
  pgadmin_data:
  localstack_data:

networks:
  default:
    name: scoutspark-network
```

## Development Dockerfiles

### Express API Dockerfile

**File**: `express-api/Dockerfile.dev`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose ports
EXPOSE 3000 9229

# Development command (overridden in docker-compose)
CMD ["npm", "run", "dev"]
```

### Lambda Worker Dockerfile

**File**: `lambda-workers/Dockerfile.dev`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Development command
CMD ["npm", "run", "dev:worker"]
```

## Production Dockerfile

**File**: `express-api/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/server.js"]
```

## Initialization Scripts

### Database Initialization

**File**: `scripts/init-db.sql`

```sql
-- Create additional databases for testing
CREATE DATABASE scoutspark_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE scoutspark_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE scoutspark_test TO postgres;
```

### LocalStack Initialization

**File**: `scripts/localstack-init.sh`

```bash
#!/bin/bash

echo "Initializing LocalStack resources..."

# Wait for LocalStack to be ready
awslocal --version

# Create SQS queue
awslocal sqs create-queue \
  --queue-name notifications-queue \
  --attributes VisibilityTimeout=300,MessageRetentionPeriod=86400

echo "Created SQS queue: notifications-queue"

# Create Dead Letter Queue
awslocal sqs create-queue \
  --queue-name notifications-dlq \
  --attributes MessageRetentionPeriod=1209600

echo "Created DLQ: notifications-dlq"

# Get DLQ ARN
DLQ_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/notifications-dlq \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

# Configure redrive policy on main queue
awslocal sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/notifications-queue \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"${DLQ_ARN}\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"

echo "Configured redrive policy"

# Create SNS topic (for email notifications)
awslocal sns create-topic --name email-notifications

echo "Created SNS topic: email-notifications"

# Create Secrets Manager secret
awslocal secretsmanager create-secret \
  --name dev/database/credentials \
  --secret-string '{"username":"postgres","password":"postgres","host":"postgres","port":"5432","database":"scoutspark_dev"}'

echo "Created Secrets Manager secret"

echo "✅ LocalStack initialization complete!"
```

Make it executable:
```bash
chmod +x scripts/localstack-init.sh
```

## Environment Files

### Development Environment

**File**: `.env.development`

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scoutspark_dev

# AWS (LocalStack)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
QUEUE_URL=http://localhost:4566/000000000000/notifications-queue

# JWT
JWT_SECRET=local-dev-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Test Environment

**File**: `.env.test`

```bash
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scoutspark_test
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
QUEUE_URL=http://localhost:4566/000000000000/test-queue
JWT_SECRET=test-secret-key-min-32-characters-long
LOG_LEVEL=error
```

### Example Environment File

**File**: `.env.example`

```bash
# Copy this file to .env and fill in the values

# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
QUEUE_URL=

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## NPM Scripts for Local Development

**File**: `express-api/package.json` (add scripts)

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "dev:debug": "tsx watch --inspect=0.0.0.0:9229 src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",

    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:clean": "docker-compose down -v",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

**File**: `lambda-workers/package.json`

```json
{
  "scripts": {
    "dev:worker": "tsx watch src/worker.ts",
    "build": "tsc",
    "start": "node dist/worker.js",
    "test": "jest"
  }
}
```

## Lambda Worker (Local Simulation)

**File**: `lambda-workers/src/worker.ts`

```typescript
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { PrismaClient } from '@prisma/client';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const prisma = new PrismaClient();
const QUEUE_URL = process.env.QUEUE_URL!;

async function processMessage(message: any) {
  console.log('Processing message:', message.MessageId);

  try {
    const body = JSON.parse(message.Body);

    // Simulate notification processing
    await prisma.notification.update({
      where: { id: body.notificationId },
      data: {
        status: 'PROCESSING',
      },
    });

    // Simulate sending notification (sleep 1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Update as sent
    await prisma.notification.update({
      where: { id: body.notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    console.log('✅ Notification sent:', body.notificationId);

  } catch (error) {
    console.error('❌ Error processing message:', error);

    // Update as failed
    if (error instanceof Error) {
      const body = JSON.parse(message.Body);
      await prisma.notification.update({
        where: { id: body.notificationId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          errorMsg: error.message,
        },
      });
    }

    throw error;
  }
}

async function pollQueue() {
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling
        VisibilityTimeout: 60,
      });

      const response = await sqsClient.send(command);

      if (response.Messages && response.Messages.length > 0) {
        console.log(`Received ${response.Messages.length} messages`);

        for (const message of response.Messages) {
          try {
            await processMessage(message);

            // Delete message from queue
            await sqsClient.send(new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            }));
          } catch (error) {
            console.error('Failed to process message:', error);
            // Message will return to queue after visibility timeout
          }
        }
      }
    } catch (error) {
      console.error('Error polling queue:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Start polling
console.log('🚀 Worker started, polling queue...');
pollQueue().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
```

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd scoutspark

# 2. Copy environment file
cp .env.example .env.development

# 3. Start Docker services
npm run docker:up

# 4. Wait for services to be healthy (check logs)
npm run docker:logs

# 5. Run database migrations
cd express-api
npm run db:migrate

# 6. Seed database
npm run db:seed

# 7. Access services:
# - API: http://localhost:3000
# - pgAdmin: http://localhost:5050 (admin@scoutspark.local / admin)
# - LocalStack: http://localhost:4566
```

### Daily Development

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Run API in watch mode (outside Docker)
cd express-api
npm run dev

# Run worker in watch mode
cd lambda-workers
npm run dev:worker

# Run tests
npm test

# View database in Prisma Studio
npm run db:studio

# Stop all services
npm run docker:down
```

### Database Operations

```bash
# Create new migration
npm run db:migrate

# Reset database (⚠️ destructive)
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Docker",
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}/express-api",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API (Local)",
      "program": "${workspaceFolder}/express-api/src/server.ts",
      "runtimeExecutable": "tsx",
      "runtimeArgs": ["--inspect"],
      "envFile": "${workspaceFolder}/.env.development",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Testing LocalStack SQS

```bash
# Send test message
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/notifications-queue \
  --message-body '{"notificationId":"test-123","userId":"user-1"}'

# Receive messages
aws --endpoint-url=http://localhost:4566 sqs receive-message \
  --queue-url http://localhost:4566/000000000000/notifications-queue

# View queue attributes
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/notifications-queue \
  --attribute-names All
```

## Troubleshooting

### Docker Issues

```bash
# Clean everything and restart
npm run docker:clean
npm run docker:up

# View container logs
docker logs scoutspark-api
docker logs scoutspark-postgres
docker logs scoutspark-localstack

# Exec into container
docker exec -it scoutspark-api sh
docker exec -it scoutspark-postgres psql -U postgres
```

### Database Issues

```bash
# Reset database completely
npm run db:reset

# Check connection
docker exec -it scoutspark-postgres psql -U postgres -d scoutspark_dev -c "SELECT version();"
```

### LocalStack Issues

```bash
# Check health
curl http://localhost:4566/_localstack/health

# Re-run init script
docker exec scoutspark-localstack /etc/localstack/init/ready.d/init.sh
```

## Next Steps

1. Set up actual AWS resources using CDK
2. Configure CI/CD pipeline
3. Deploy to staging/production
4. Set up monitoring and alerting
