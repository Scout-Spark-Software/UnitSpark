# WorkOS Hybrid Strategy Implementation Guide

## Overview

This guide implements **Strategy B (Hybrid)**: WorkOS handles authentication, local database stores user profiles and custom data, webhooks keep everything in sync.

## Architecture Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        User Flow                              │
└──────────────────────────────────────────────────────────────┘

1. User visits app → Redirected to WorkOS login
2. WorkOS authenticates → Returns session token
3. API validates session → Creates/updates local user profile
4. User data stored locally → Fast queries, custom fields
5. WorkOS webhooks → Keep local data in sync
```

## Phase 1: Setup & Dependencies

### Install WorkOS SDK

```bash
cd express-api
npm install @workos-inc/node
```

### Environment Variables

Update `.env.development`:

```bash
# WorkOS Configuration
WORKOS_API_KEY=sk_test_your_api_key
WORKOS_CLIENT_ID=client_your_client_id
WORKOS_WEBHOOK_SECRET=wh_secret_your_webhook_secret
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Cookie Configuration
COOKIE_DOMAIN=localhost  # .yourapp.com in production
SESSION_SECRET=your-session-secret-min-32-characters
```

Update `.env.example`:

```bash
# WorkOS
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_WEBHOOK_SECRET=
WORKOS_REDIRECT_URI=
COOKIE_DOMAIN=
SESSION_SECRET=
```

## Phase 2: Database Schema Updates

### Updated Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with WorkOS integration
model User {
  id              String    @id @default(uuid())
  workosId        String    @unique @map("workos_id")
  email           String    @unique
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")

  // Custom fields (not in WorkOS)
  avatarUrl       String?   @map("avatar_url")
  bio             String?   @db.Text
  timezone        String    @default("UTC")
  preferences     Json?     // Site-specific preferences
  lastLoginAt     DateTime? @map("last_login_at")

  isActive        Boolean   @default(true) @map("is_active")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  notifications   Notification[]
  organizationMemberships OrganizationMembership[]

  @@map("users")
  @@index([workosId])
  @@index([email])
  @@index([lastLoginAt])
}

// Organization model (for Site 1 multi-tenancy)
model Organization {
  id              String    @id @default(uuid())
  workosOrgId     String    @unique @map("workos_org_id")
  name            String
  slug            String    @unique // For subdomains (org1.app.com)
  domain          String?   // Custom domain
  logoUrl         String?   @map("logo_url")

  settings        Json?     // Org-specific settings

  isActive        Boolean   @default(true) @map("is_active")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  memberships     OrganizationMembership[]

  @@map("organizations")
  @@index([workosOrgId])
  @@index([slug])
}

// User-Organization relationship with roles
model OrganizationMembership {
  id              String           @id @default(uuid())
  userId          String           @map("user_id")
  organizationId  String           @map("organization_id")
  role            OrganizationRole @default(MEMBER)

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@map("organization_memberships")
  @@index([userId])
  @@index([organizationId])
}

enum OrganizationRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// Notification model (unchanged)
model Notification {
  id          String             @id @default(uuid())
  userId      String             @map("user_id")
  type        NotificationType
  status      NotificationStatus @default(PENDING)
  subject     String
  message     String             @db.Text
  metadata    Json?

  sentAt      DateTime?          @map("sent_at")
  failedAt    DateTime?          @map("failed_at")
  errorMsg    String?            @map("error_msg") @db.Text

  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")

  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum NotificationType {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum NotificationStatus {
  PENDING
  QUEUED
  PROCESSING
  SENT
  FAILED
  CANCELLED
}
```

### Run Migration

```bash
npx prisma migrate dev --name add_workos_integration
```

## Phase 3: WorkOS Configuration

### WorkOS Client Setup

**File**: `src/config/workos.ts`

```typescript
import { WorkOS } from '@workos-inc/node';
import { env } from './environment';

export const workos = new WorkOS(env.WORKOS_API_KEY);

export const workosConfig = {
  clientId: env.WORKOS_CLIENT_ID,
  redirectUri: env.WORKOS_REDIRECT_URI,
  webhookSecret: env.WORKOS_WEBHOOK_SECRET,
};
```

### Environment Config Updates

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

  // WorkOS
  WORKOS_API_KEY: z.string().min(1),
  WORKOS_CLIENT_ID: z.string().min(1),
  WORKOS_WEBHOOK_SECRET: z.string().min(1),
  WORKOS_REDIRECT_URI: z.string().url(),

  // Session/Cookie
  COOKIE_DOMAIN: z.string().default('localhost'),
  SESSION_SECRET: z.string().min(32),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

export const env = envSchema.parse(process.env);
export type Environment = z.infer<typeof envSchema>;
```

## Phase 4: Authentication Middleware

### WorkOS Auth Middleware

**File**: `src/middleware/workos-auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { workos } from '../config/workos';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        workosId: string;
        email: string;
        firstName: string;
        lastName: string;
        organizationId?: string;
        role?: string;
      };
    }
  }
}

export const workosAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session cookie
    const sessionCookie = req.cookies.workos_session;

    if (!sessionCookie) {
      throw new UnauthorizedError('No session found');
    }

    // Verify session with WorkOS
    const { user: workosUser, organizationId, role } =
      await workos.userManagement.authenticateWithSessionCookie({
        sessionData: sessionCookie,
      });

    logger.debug('WorkOS session verified', { userId: workosUser.id });

    // Get or create local user profile
    let user = await prisma.user.findUnique({
      where: { workosId: workosUser.id },
      include: {
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      // First login - create user profile
      logger.info('Creating new user profile', { workosId: workosUser.id });

      user = await prisma.user.create({
        data: {
          workosId: workosUser.id,
          email: workosUser.email,
          firstName: workosUser.firstName || '',
          lastName: workosUser.lastName || '',
          lastLoginAt: new Date(),
        },
        include: {
          organizationMemberships: {
            include: {
              organization: true,
            },
          },
        },
      });
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      workosId: user.workosId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId,
      role,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);

    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: { message: error.message, code: 'UNAUTHORIZED' },
      });
    }

    res.status(401).json({
      success: false,
      error: { message: 'Invalid session', code: 'INVALID_SESSION' },
    });
  }
};

// Optional middleware - require specific organization
export const requireOrganization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.organizationId) {
    return res.status(403).json({
      success: false,
      error: { message: 'Organization required', code: 'NO_ORGANIZATION' },
    });
  }
  next();
};

// Optional middleware - require specific role
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions', code: 'FORBIDDEN' },
      });
    }
    next();
  };
};
```

## Phase 5: Auth Routes & Controllers

### Auth Routes

**File**: `src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Initiate login
router.get('/login', authController.login);

// OAuth callback
router.get('/callback', authController.callback);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authController.getCurrentUser);

export default router;
```

### Auth Controller

**File**: `src/controllers/auth.controller.ts`

```typescript
import { Request, Response } from 'express';
import { workos, workosConfig } from '../config/workos';
import { env } from '../config/environment';
import { asyncHandler } from '../utils/async-handler';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

export class AuthController {
  // Initiate WorkOS login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { organization } = req.query;

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: workosConfig.clientId,
      redirectUri: workosConfig.redirectUri,
      state: JSON.stringify({
        returnTo: req.query.returnTo || '/',
      }),
      ...(organization && { organization: organization as string }),
    });

    res.redirect(authorizationUrl);
  });

  // Handle OAuth callback
  callback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    try {
      // Exchange code for session
      const { user, organizationId, accessToken, refreshToken } =
        await workos.userManagement.authenticateWithCode({
          code: code as string,
          clientId: workosConfig.clientId,
        });

      logger.info('User authenticated', { userId: user.id, organizationId });

      // Create or update user in local database
      let localUser = await prisma.user.findUnique({
        where: { workosId: user.id },
      });

      if (!localUser) {
        localUser = await prisma.user.create({
          data: {
            workosId: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            lastLoginAt: new Date(),
          },
        });
      } else {
        localUser = await prisma.user.update({
          where: { id: localUser.id },
          data: { lastLoginAt: new Date() },
        });
      }

      // If user belongs to an organization, sync it
      if (organizationId) {
        await this.syncOrganization(organizationId, localUser.id);
      }

      // Set session cookie
      const isProd = env.NODE_ENV === 'production';
      res.cookie('workos_session', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        domain: env.COOKIE_DOMAIN,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Parse return URL from state
      const stateData = state ? JSON.parse(state as string) : {};
      const returnTo = stateData.returnTo || '/';

      res.redirect(returnTo);
    } catch (error) {
      logger.error('Auth callback error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Logout
  logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('workos_session', {
      domain: env.COOKIE_DOMAIN,
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: user,
    });
  });

  // Helper: Sync organization from WorkOS
  private async syncOrganization(workosOrgId: string, userId: string) {
    try {
      // Fetch org details from WorkOS
      const workosOrg = await workos.organizations.getOrganization(workosOrgId);

      // Create or update organization
      let org = await prisma.organization.findUnique({
        where: { workosOrgId },
      });

      if (!org) {
        org = await prisma.organization.create({
          data: {
            workosOrgId,
            name: workosOrg.name,
            slug: this.generateSlug(workosOrg.name),
          },
        });
      }

      // Create membership if it doesn't exist
      await prisma.organizationMembership.upsert({
        where: {
          userId_organizationId: {
            userId,
            organizationId: org.id,
          },
        },
        create: {
          userId,
          organizationId: org.id,
          role: 'MEMBER',
        },
        update: {},
      });

      logger.info('Organization synced', { orgId: org.id });
    } catch (error) {
      logger.error('Failed to sync organization:', error);
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
```

## Phase 6: WorkOS Webhooks

### Webhook Handler

**File**: `src/routes/webhooks.routes.ts`

```typescript
import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();
const webhookController = new WebhookController();

// WorkOS webhooks (raw body needed for signature verification)
router.post(
  '/workos',
  express.raw({ type: 'application/json' }),
  webhookController.handleWorkOS
);

export default router;
```

**File**: `src/controllers/webhook.controller.ts`

```typescript
import { Request, Response } from 'express';
import { workos, workosConfig } from '../config/workos';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../utils/async-handler';

export class WebhookController {
  handleWorkOS = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['workos-signature'] as string;
    const rawBody = req.body.toString();

    try {
      // Verify webhook signature
      const webhook = workos.webhooks.constructEvent({
        payload: rawBody,
        sigHeader: signature,
        secret: workosConfig.webhookSecret,
      });

      logger.info('Received WorkOS webhook', { event: webhook.event });

      // Handle different event types
      switch (webhook.event) {
        case 'user.created':
          await this.handleUserCreated(webhook.data);
          break;

        case 'user.updated':
          await this.handleUserUpdated(webhook.data);
          break;

        case 'user.deleted':
          await this.handleUserDeleted(webhook.data);
          break;

        case 'organization.created':
          await this.handleOrganizationCreated(webhook.data);
          break;

        case 'organization.updated':
          await this.handleOrganizationUpdated(webhook.data);
          break;

        case 'organization.deleted':
          await this.handleOrganizationDeleted(webhook.data);
          break;

        case 'organization_membership.created':
          await this.handleMembershipCreated(webhook.data);
          break;

        case 'organization_membership.deleted':
          await this.handleMembershipDeleted(webhook.data);
          break;

        default:
          logger.warn('Unhandled webhook event', { event: webhook.event });
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  });

  private async handleUserCreated(data: any) {
    await prisma.user.upsert({
      where: { workosId: data.id },
      create: {
        workosId: data.id,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
      },
      update: {},
    });
    logger.info('User created from webhook', { userId: data.id });
  }

  private async handleUserUpdated(data: any) {
    await prisma.user.update({
      where: { workosId: data.id },
      data: {
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
      },
    });
    logger.info('User updated from webhook', { userId: data.id });
  }

  private async handleUserDeleted(data: any) {
    await prisma.user.update({
      where: { workosId: data.id },
      data: { isActive: false },
    });
    logger.info('User soft-deleted from webhook', { userId: data.id });
  }

  private async handleOrganizationCreated(data: any) {
    await prisma.organization.create({
      data: {
        workosOrgId: data.id,
        name: data.name,
        slug: this.generateSlug(data.name),
      },
    });
    logger.info('Organization created from webhook', { orgId: data.id });
  }

  private async handleOrganizationUpdated(data: any) {
    await prisma.organization.update({
      where: { workosOrgId: data.id },
      data: {
        name: data.name,
      },
    });
    logger.info('Organization updated from webhook', { orgId: data.id });
  }

  private async handleOrganizationDeleted(data: any) {
    await prisma.organization.update({
      where: { workosOrgId: data.id },
      data: { isActive: false },
    });
    logger.info('Organization soft-deleted from webhook', { orgId: data.id });
  }

  private async handleMembershipCreated(data: any) {
    const user = await prisma.user.findUnique({
      where: { workosId: data.user_id },
    });

    const org = await prisma.organization.findUnique({
      where: { workosOrgId: data.organization_id },
    });

    if (user && org) {
      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: this.mapWorkOSRole(data.role),
        },
      });
      logger.info('Membership created from webhook', { userId: user.id, orgId: org.id });
    }
  }

  private async handleMembershipDeleted(data: any) {
    const user = await prisma.user.findUnique({
      where: { workosId: data.user_id },
    });

    const org = await prisma.organization.findUnique({
      where: { workosOrgId: data.organization_id },
    });

    if (user && org) {
      await prisma.organizationMembership.delete({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: org.id,
          },
        },
      });
      logger.info('Membership deleted from webhook', { userId: user.id, orgId: org.id });
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private mapWorkOSRole(workosRole: string): 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' {
    switch (workosRole?.toLowerCase()) {
      case 'owner':
        return 'OWNER';
      case 'admin':
        return 'ADMIN';
      case 'viewer':
        return 'VIEWER';
      default:
        return 'MEMBER';
    }
  }
}
```

## Phase 7: Update App.ts

**File**: `src/app.ts` (add webhook routes)

```typescript
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import routes from './routes';
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhooks.routes';
import { env } from './config/environment';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: env.NODE_ENV === 'production'
      ? ['https://yourapp.com', 'https://*.yourapp.com']
      : true,
    credentials: true,
  }));

  // Cookie parser (for session cookies)
  app.use(cookieParser());

  // Webhooks (BEFORE body parsing - needs raw body)
  app.use('/webhooks', webhookRoutes);

  // Body parsing (AFTER webhooks)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(loggingMiddleware);

  // Rate limiting
  app.use(rateLimitMiddleware);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', routes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Global error handler
  app.use(errorMiddleware);

  return app;
};
```

## Phase 8: Testing

### Test Auth Flow

```bash
# 1. Start local dev
npm run dev

# 2. Visit login URL
curl http://localhost:3000/api/auth/login

# 3. Complete WorkOS login in browser

# 4. Check current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: workos_session=YOUR_SESSION_TOKEN"
```

### Test Webhooks Locally

Use WorkOS CLI or ngrok:

```bash
# Install WorkOS CLI
npm install -g @workos-inc/workos-cli

# Forward webhooks to local
workos webhooks listen --forward-to http://localhost:3000/webhooks/workos
```

## Phase 9: Production Checklist

- [ ] Set `COOKIE_DOMAIN=.yourapp.com` in production
- [ ] Use `secure: true` for cookies (HTTPS only)
- [ ] Configure WorkOS webhooks in dashboard
- [ ] Set up WorkOS environments (dev, staging, prod)
- [ ] Add WorkOS secrets to GitHub Actions
- [ ] Test session sharing across subdomains
- [ ] Monitor webhook failures
- [ ] Set up CloudWatch alarms for auth errors

## Next Steps

1. **Add protected routes** using `workosAuthMiddleware`
2. **Implement subdomain routing** for Site 1 multi-tenancy
3. **Create organization management endpoints**
4. **Add role-based access control**
5. **Build frontend auth flows**

## Additional Dependencies

Don't forget to install:

```bash
npm install cookie-parser
npm install @types/cookie-parser --save-dev
```

---

**Ready to implement?** This gives you a complete WorkOS hybrid integration! 🚀
