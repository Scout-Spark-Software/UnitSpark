# Express API Structure

## Overview

Clean architecture Express API with TypeScript, following best practices for scalability, maintainability, and testability.

## Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest + Supertest
- **Authentication**: JWT (jsonwebtoken)

## Project Structure

```
express-api/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Server entry point
│   │
│   ├── config/
│   │   ├── index.ts                    # Config aggregator
│   │   ├── environment.ts              # Environment variables (validated with Zod)
│   │   ├── database.ts                 # Prisma client singleton
│   │   ├── queue.ts                    # SQS client configuration
│   │   └── logger.ts                   # Pino logger setup
│   │
│   ├── routes/
│   │   ├── index.ts                    # Route aggregator
│   │   ├── health.routes.ts            # Health check endpoints
│   │   ├── auth.routes.ts              # Authentication routes
│   │   ├── users.routes.ts             # User CRUD routes
│   │   ├── notifications.routes.ts     # Notification routes
│   │   └── admin.routes.ts             # Admin routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts          # Auth handlers
│   │   ├── users.controller.ts         # User handlers
│   │   ├── notifications.controller.ts # Notification handlers
│   │   └── health.controller.ts        # Health check handlers
│   │
│   ├── services/
│   │   ├── auth.service.ts             # Authentication logic
│   │   ├── user.service.ts             # User business logic
│   │   ├── notification.service.ts     # Notification business logic
│   │   ├── queue.service.ts            # SQS operations
│   │   └── email.service.ts            # Email sending (SNS/SES)
│   │
│   ├── repositories/
│   │   ├── base.repository.ts          # Base repository with common methods
│   │   ├── user.repository.ts          # User data access
│   │   └── notification.repository.ts  # Notification data access
│   │
│   ├── models/
│   │   ├── user.model.ts               # User domain model
│   │   ├── notification.model.ts       # Notification domain model
│   │   └── index.ts                    # Model exports
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts          # JWT validation
│   │   ├── error.middleware.ts         # Global error handler
│   │   ├── logging.middleware.ts       # Request logging
│   │   ├── validation.middleware.ts    # Zod validation
│   │   ├── rate-limit.middleware.ts    # Rate limiting
│   │   └── cors.middleware.ts          # CORS configuration
│   │
│   ├── validators/
│   │   ├── user.validator.ts           # User validation schemas
│   │   ├── notification.validator.ts   # Notification validation schemas
│   │   └── auth.validator.ts           # Auth validation schemas
│   │
│   ├── utils/
│   │   ├── errors.ts                   # Custom error classes
│   │   ├── async-handler.ts            # Async error wrapper
│   │   ├── jwt.ts                      # JWT utilities
│   │   └── response.ts                 # Standard response helpers
│   │
│   └── types/
│       ├── index.ts                    # Type definitions
│       ├── express.d.ts                # Express type extensions
│       └── environment.d.ts            # Environment types
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── migrations/                     # Migration files
│   └── seed.ts                         # Database seeding
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/
│   │   ├── routes/
│   │   └── services/
│   └── e2e/
│       └── api.test.ts
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Core Files

### 1. Environment Configuration

**File**: `src/config/environment.ts`

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Database
  DATABASE_URL: z.string().url(),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  QUEUE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

export const env = envSchema.parse(process.env);

export type Environment = z.infer<typeof envSchema>;
```

### 2. Database Configuration

**File**: `src/config/database.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 3. Logger Configuration

**File**: `src/config/logger.ts`

```typescript
import pino from 'pino';
import { env } from './environment';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});
```

### 4. Queue Service

**File**: `src/config/queue.ts`

```typescript
import { SQSClient } from '@aws-sdk/client-sqs';
import { env } from './environment';

export const sqsClient = new SQSClient({
  region: env.AWS_REGION,
});
```

### 5. Express App Setup

**File**: `src/app.ts`

```typescript
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import routes from './routes';
import { env } from './config/environment';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: env.NODE_ENV === 'production'
      ? ['https://yourdomain.com']
      : '*',
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(loggingMiddleware);

  // Rate limiting
  app.use(rateLimitMiddleware);

  // Routes
  app.use('/api', routes);

  // Health check (outside /api prefix for ALB)
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
};
```

### 6. Server Entry Point

**File**: `src/server.ts`

```typescript
import { createApp } from './app';
import { env } from './config/environment';
import { logger } from './config/logger';
import { prisma } from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Create and start Express app
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### 7. Route Aggregator

**File**: `src/routes/index.ts`

```typescript
import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import notificationRoutes from './notifications.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

export default router;
```

### 8. Health Routes

**File**: `src/routes/health.routes.ts`

```typescript
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const healthController = new HealthController();

router.get('/', healthController.basic);
router.get('/ready', healthController.readiness);
router.get('/live', healthController.liveness);

export default router;
```

### 9. User Routes

**File**: `src/routes/users.routes.ts`

```typescript
import { Router } from 'express';
import { UserController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.delete);

export default router;
```

### 10. Notification Routes

**File**: `src/routes/notifications.routes.ts`

```typescript
import { Router } from 'express';
import { NotificationController } from '../controllers/notifications.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createNotificationSchema, bulkNotificationSchema } from '../validators/notification.validator';

const router = Router();
const notificationController = new NotificationController();

router.use(authMiddleware);

router.post('/', validate(createNotificationSchema), notificationController.create);
router.post('/bulk', validate(bulkNotificationSchema), notificationController.createBulk);
router.get('/:id/status', notificationController.getStatus);

export default router;
```

### 11. User Controller

**File**: `src/controllers/users.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();
    res.json(successResponse(users));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getUserById(req.params.id);
    res.json(successResponse(user));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(successResponse(user));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    res.json(successResponse(user));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  });
}
```

### 12. Notification Controller

**File**: `src/controllers/notifications.controller.ts`

```typescript
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const notification = await this.notificationService.createNotification(req.body);
    res.status(201).json(successResponse(notification));
  });

  createBulk = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.notificationService.createBulkNotifications(req.body);
    res.status(202).json(successResponse(result, 'Notifications queued for processing'));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await this.notificationService.getNotificationStatus(req.params.id);
    res.json(successResponse(status));
  });
}
```

### 13. Queue Service

**File**: `src/services/queue.service.ts`

```typescript
import { SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '../config/queue';
import { env } from '../config/environment';
import { logger } from '../config/logger';

export class QueueService {
  async sendMessage(message: any): Promise<void> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: env.QUEUE_URL,
        MessageBody: JSON.stringify(message),
      });

      await sqsClient.send(command);
      logger.info('Message sent to queue', { messageId: message.id });
    } catch (error) {
      logger.error('Failed to send message to queue', error);
      throw error;
    }
  }

  async sendBatch(messages: any[]): Promise<void> {
    // SQS batch limit is 10
    const chunks = this.chunkArray(messages, 10);

    for (const chunk of chunks) {
      try {
        const command = new SendMessageBatchCommand({
          QueueUrl: env.QUEUE_URL,
          Entries: chunk.map((msg, index) => ({
            Id: index.toString(),
            MessageBody: JSON.stringify(msg),
          })),
        });

        const result = await sqsClient.send(command);

        if (result.Failed && result.Failed.length > 0) {
          logger.error('Some messages failed to send', { failed: result.Failed });
        }

        logger.info(`Batch sent to queue: ${chunk.length} messages`);
      } catch (error) {
        logger.error('Failed to send batch to queue', error);
        throw error;
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### 14. Error Middleware

**File**: `src/middleware/error.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  // Custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A record with this value already exists',
          code: 'DUPLICATE_RECORD',
        },
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Record not found',
          code: 'NOT_FOUND',
        },
      });
    }
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message,
      code: 'INTERNAL_ERROR',
    },
  });
};
```

### 15. Custom Errors

**File**: `src/utils/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}
```

### 16. Async Handler

**File**: `src/utils/async-handler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 17. Response Utilities

**File**: `src/utils/response.ts`

```typescript
export const successResponse = (data: any, message: string = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

export const paginatedResponse = (
  data: any[],
  page: number,
  limit: number,
  total: number
) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
```

## Package.json

```json
{
  "name": "express-api",
  "version": "1.0.0",
  "description": "Express API with TypeScript",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@aws-sdk/client-sqs": "^3.478.0",
    "@prisma/client": "^5.7.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^8.17.1",
    "pino-pretty": "^10.3.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.6",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "prisma": "^5.7.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

## Next Steps

1. **Implement authentication** with JWT
2. **Add more routes** as needed
3. **Write comprehensive tests**
4. **Add API documentation** (Swagger/OpenAPI)
5. **Implement caching** (Redis)
6. **Add request tracing** (AWS X-Ray)
