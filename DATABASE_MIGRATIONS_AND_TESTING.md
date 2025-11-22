# Database Migrations & Testing Strategy

## Database Migrations with Prisma

### Overview

Prisma provides a robust migration system for managing database schema changes with version control and rollback capabilities.

### Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String         @map("password_hash")
  firstName     String         @map("first_name")
  lastName      String         @map("last_name")
  role          UserRole       @default(USER)
  isActive      Boolean        @default(true) @map("is_active")

  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  notifications Notification[]

  @@map("users")
  @@index([email])
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

// Notification model
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

// Audit log for tracking changes
model AuditLog {
  id          String    @id @default(uuid())
  userId      String?   @map("user_id")
  action      String
  entity      String
  entityId    String    @map("entity_id")
  changes     Json?
  ipAddress   String?   @map("ip_address")
  userAgent   String?   @map("user_agent")

  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("audit_logs")
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

### Migration Workflow

#### 1. Development Workflow

```bash
# Create a new migration
npx prisma migrate dev --name add_user_table

# This will:
# 1. Create SQL migration file in prisma/migrations/
# 2. Apply migration to database
# 3. Regenerate Prisma Client
```

#### 2. Staging/Production Workflow

```bash
# Deploy migrations (CI/CD)
npx prisma migrate deploy

# This will:
# 1. Apply pending migrations
# 2. Does NOT create new migrations
# 3. Safe for production use
```

#### 3. Migration Best Practices

**Making Schema Changes**:

```bash
# Step 1: Modify schema.prisma
# Step 2: Create migration
npx prisma migrate dev --name descriptive_name

# Step 3: Review generated SQL
cat prisma/migrations/YYYYMMDDHHMMSS_descriptive_name/migration.sql

# Step 4: Test locally
npm run test:integration

# Step 5: Commit migration files
git add prisma/migrations
git commit -m "Add migration: descriptive_name"
```

**Backward-Compatible Migrations**:

```sql
-- ✅ GOOD: Make new columns nullable first
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- Later, after deploy, make it required
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;

-- ❌ BAD: Adding non-nullable column without default
ALTER TABLE "users" ADD COLUMN "phone" TEXT NOT NULL;
-- This will fail if table has existing rows
```

### Advanced Migration Scenarios

#### Adding a Column with Default Value

```prisma
model User {
  // ...existing fields
  timezone String @default("UTC") // Safe to add
}
```

Generated SQL:
```sql
ALTER TABLE "users" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';
```

#### Renaming a Column (Zero Downtime)

**Step 1**: Add new column
```prisma
model User {
  email     String @unique
  emailAddr String @unique @map("email_addr") // New column
}
```

**Step 2**: Deploy, update app to write to both columns

**Step 3**: Backfill data
```sql
UPDATE users SET email_addr = email WHERE email_addr IS NULL;
```

**Step 4**: Remove old column
```prisma
model User {
  emailAddr String @unique @map("email_addr")
}
```

#### Complex Data Migration

**File**: `prisma/migrations/20240101000000_migrate_user_names/migration.sql`

```sql
-- Prisma auto-generated migration
ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;

-- Custom data migration
UPDATE users
SET
  first_name = split_part(full_name, ' ', 1),
  last_name = split_part(full_name, ' ', 2)
WHERE full_name IS NOT NULL;

-- Make columns required after data migration
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;

-- Drop old column
ALTER TABLE "users" DROP COLUMN "full_name";
```

### Database Seeding

**File**: `prisma/seed.ts`

```typescript
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test users
  const testUsers = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const password = await bcrypt.hash('password123', 10);
      return prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          passwordHash: password,
          firstName: `User`,
          lastName: `${i + 1}`,
          role: UserRole.USER,
        },
      });
    })
  );

  console.log(`✅ Created ${testUsers.length} test users`);

  // Create sample notifications
  const notifications = await Promise.all(
    testUsers.slice(0, 5).map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          type: 'EMAIL',
          status: 'SENT',
          subject: 'Welcome!',
          message: 'Welcome to our platform',
          sentAt: new Date(),
        },
      })
    )
  );

  console.log(`✅ Created ${notifications.length} sample notifications`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seeding:
```bash
npm run prisma:seed
```

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \          ← Few (slow, expensive)
     /------\
    /        \
   /Integration\       ← Some (moderate speed)
  /------------\
 /              \
/  Unit Tests    \     ← Many (fast, cheap)
------------------
```

### Test Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Test Setup

**File**: `tests/setup.ts`

```typescript
import { prisma } from '../src/config/database';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database between tests
afterEach(async () => {
  const tables = ['notifications', 'users', 'audit_logs'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});
```

### 1. Unit Tests

Test individual functions/methods in isolation.

**File**: `tests/unit/services/user.service.test.ts`

```typescript
import { UserService } from '../../../src/services/user.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { NotFoundError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = userRepository;
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('999'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const createdUser = {
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      userRepository.create.mockResolvedValue(createdUser as any);

      const result = await userService.createUser(userData);

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          passwordHash: expect.any(String), // Should be hashed
        })
      );
    });
  });
});
```

**File**: `tests/unit/utils/jwt.test.ts`

```typescript
import { generateToken, verifyToken } from '../../../src/utils/jwt';

describe('JWT Utils', () => {
  const payload = { userId: '123', email: 'test@example.com' };

  it('should generate valid JWT token', () => {
    const token = generateToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should verify valid token', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded).toMatchObject(payload);
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token'))
      .toThrow();
  });

  it('should throw error for expired token', () => {
    // Create token that expires immediately
    const token = generateToken(payload, '0s');

    // Wait a bit
    setTimeout(() => {
      expect(() => verifyToken(token)).toThrow('jwt expired');
    }, 100);
  });
});
```

### 2. Integration Tests

Test multiple components working together.

**File**: `tests/integration/repositories/user.repository.test.ts`

```typescript
import { UserRepository } from '../../../src/repositories/user.repository';
import { UserRole } from '@prisma/client';
import { prisma } from '../../../src/config/database';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  describe('create', () => {
    it('should create user in database', async () => {
      const userData = {
        email: 'integration@test.com',
        passwordHash: 'hashed_password',
        firstName: 'Integration',
        lastName: 'Test',
        role: UserRole.USER,
      };

      const user = await userRepository.create(userData);

      expect(user).toMatchObject(userData);
      expect(user.id).toBeTruthy();
      expect(user.createdAt).toBeInstanceOf(Date);

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(dbUser).toBeTruthy();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@test.com',
        passwordHash: 'hashed',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
      };

      await userRepository.create(userData);

      // Try to create duplicate
      await expect(userRepository.create(userData))
        .rejects
        .toThrow();
    });
  });

  describe('findById', () => {
    it('should return user when exists', async () => {
      const created = await userRepository.create({
        email: 'find@test.com',
        passwordHash: 'hashed',
        firstName: 'Find',
        lastName: 'Me',
        role: UserRole.USER,
      });

      const found = await userRepository.findById(created.id);

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
      });
    });

    it('should return null when not exists', async () => {
      const found = await userRepository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });
});
```

### 3. E2E Tests

Test complete API endpoints.

**File**: `tests/e2e/api.test.ts`

```typescript
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import bcrypt from 'bcrypt';

describe('API E2E Tests', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'e2e@test.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'Test',
        role: 'USER',
      },
    });
    userId = user.id;

    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'e2e@test.com',
        password: 'password123',
      });

    authToken = response.body.data.token;
  });

  describe('GET /api/users/:id', () => {
    it('should return user when authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: userId,
        email: 'e2e@test.com',
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/notifications/bulk', () => {
    it('should queue bulk notifications', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userIds: [userId],
          type: 'EMAIL',
          subject: 'Test Notification',
          message: 'This is a test',
        });

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.data.queued).toBe(1);

      // Verify notification created in DB
      const notification = await prisma.notification.findFirst({
        where: { userId },
      });
      expect(notification).toBeTruthy();
      expect(notification?.status).toBe('QUEUED');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
```

### 4. Load Testing (Optional)

**File**: `tests/load/api.load.test.ts`

```typescript
import autocannon from 'autocannon';

describe('Load Tests', () => {
  it('should handle 100 concurrent requests', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/health',
      connections: 100,
      duration: 10, // seconds
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.non2xx).toBe(0);
    expect(result.latency.mean).toBeLessThan(100); // ms
  }, 15000);
});
```

### Test Database Setup

**File**: `.env.test`

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
NODE_ENV=test
JWT_SECRET=test-secret-key-min-32-characters
AWS_REGION=us-east-1
QUEUE_URL=http://localhost:4566/000000000000/test-queue
LOG_LEVEL=error
```

**Update package.json**:

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "pretest": "NODE_ENV=test npx prisma migrate deploy"
  }
}
```

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### CI/CD Integration

Already included in `CI_CD_PIPELINE.md` workflow!

## Best Practices Summary

### Migrations
- ✅ Always review generated SQL
- ✅ Make migrations backward-compatible
- ✅ Test migrations locally first
- ✅ Use transactions for complex migrations
- ✅ Keep migrations small and focused
- ❌ Never modify existing migrations in production
- ❌ Don't skip migration testing

### Testing
- ✅ Write tests for all business logic
- ✅ Test error cases, not just happy paths
- ✅ Keep tests independent and isolated
- ✅ Use factories/fixtures for test data
- ✅ Mock external dependencies
- ❌ Don't test implementation details
- ❌ Don't skip integration tests
