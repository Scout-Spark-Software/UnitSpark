# WorkOS Authentication Architecture

## System Overview

### Sites Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        WorkOS (Auth Provider)                │
│  - Organizations                                             │
│  - SSO                                                       │
│  - User Management                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│    Site 1      │ │   Site 2    │ │    Site 3      │
│  Multi-tenant  │ │  Dashboard  │ │   Analytics    │
│   B2B SaaS     │ │             │ │                │
│                │ │             │ │                │
│ org1.app.com   │ │ dash.app.com│ │ stats.app.com  │
│ org2.app.com   │ │             │ │                │
│ org3.app.com   │ │             │ │                │
└───────┬────────┘ └──────┬──────┘ └───────┬────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼─────┐
                    │    API    │
                    │  Backend  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  Aurora   │
                    │    DB     │
                    └───────────┘
```

### Site Requirements

| Site | Type | Organizations | Roles | Complexity |
|------|------|---------------|-------|------------|
| Site 1 | B2B SaaS | Many (customer orgs) | Admin, Member, Viewer | High |
| Site 2 | Internal Dashboard | 1 (your org) | Basic roles | Low |
| Site 3 | Analytics | 1 (your org) | Basic roles | Low |

## WorkOS Integration Strategies

### Strategy A: WorkOS as Source of Truth (Minimal Sync)

**Architecture**:
```
User Login → WorkOS → JWT → API validates JWT → No DB lookup
```

**How it works**:
- WorkOS handles all user data
- API validates WorkOS JWT tokens
- User info extracted from JWT claims
- No user table in your database
- Only store user IDs as foreign keys

**Express Middleware Example**:
```typescript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verify WorkOS session
    const { user, organizationId, role } = await workos.userManagement.authenticateWithSessionCookie(token);

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId,
      role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

**Database Schema**:
```prisma
model Notification {
  id              String   @id @default(uuid())
  workosUserId    String   @map("workos_user_id") // Just store WorkOS ID
  // ... other fields
}

// No User table!
```

**Pros**:
- ✅ Simple implementation
- ✅ No user sync issues
- ✅ WorkOS handles password resets, email verification
- ✅ Always up-to-date user data
- ✅ Less database storage
- ✅ SSO works out of the box
- ✅ Automatic org/role management

**Cons**:
- ❌ Can't query users efficiently (must call WorkOS API)
- ❌ Expensive if you need user lists frequently
- ❌ Dependent on WorkOS availability for all requests
- ❌ Can't add custom user fields easily
- ❌ Slower (extra API call on each request)
- ❌ No complex user queries/analytics
- ❌ WorkOS API rate limits

**Best for**: Simple apps, low user query needs

---

### Strategy B: Hybrid (Auth + Profile Sync)

**Architecture**:
```
User Login → WorkOS → JWT → API validates JWT → Lookup local user profile
```

**How it works**:
- WorkOS handles authentication
- Sync basic user info to local DB
- Store additional user preferences/data locally
- Use WorkOS webhooks to keep in sync

**Express Middleware**:
```typescript
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Verify with WorkOS
    const { user: workosUser, organizationId, role } =
      await workos.userManagement.authenticateWithSessionCookie(token);

    // Get or create local user profile
    let user = await prisma.user.findUnique({
      where: { workosId: workosUser.id }
    });

    if (!user) {
      // First login - create profile
      user = await prisma.user.create({
        data: {
          workosId: workosUser.id,
          email: workosUser.email,
          firstName: workosUser.firstName,
          lastName: workosUser.lastName,
        }
      });
    }

    req.user = {
      ...user,
      organizationId,
      role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

**Database Schema**:
```prisma
model User {
  id              String    @id @default(uuid())
  workosId        String    @unique @map("workos_id")
  email           String    @unique
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")

  // Custom fields WorkOS doesn't handle
  avatarUrl       String?   @map("avatar_url")
  bio             String?
  timezone        String    @default("UTC")
  preferences     Json?
  lastLoginAt     DateTime? @map("last_login_at")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  notifications   Notification[]

  @@map("users")
  @@index([workosId])
  @@index([email])
}
```

**WorkOS Webhook Handler**:
```typescript
// Handle WorkOS events to keep data in sync
app.post('/webhooks/workos', async (req, res) => {
  const event = req.body;

  switch (event.event) {
    case 'user.created':
      await prisma.user.create({
        data: {
          workosId: event.data.id,
          email: event.data.email,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
        }
      });
      break;

    case 'user.updated':
      await prisma.user.update({
        where: { workosId: event.data.id },
        data: {
          email: event.data.email,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
        }
      });
      break;

    case 'user.deleted':
      await prisma.user.delete({
        where: { workosId: event.data.id }
      });
      break;
  }

  res.json({ received: true });
});
```

**Pros**:
- ✅ Fast user queries (local DB)
- ✅ Can store custom user data
- ✅ Good for analytics/reporting
- ✅ WorkOS handles auth complexity
- ✅ Can work offline (cached user data)
- ✅ Flexible data model
- ✅ Best of both worlds

**Cons**:
- ❌ Sync complexity (webhooks can fail)
- ❌ Data can get out of sync
- ❌ More code to maintain
- ❌ Need to handle sync failures
- ❌ Duplicate data storage

**Best for**: Most production apps (recommended)

---

### Strategy C: Full Ownership (WorkOS Auth Only)

**Architecture**:
```
User Login → WorkOS → Exchange token → API creates session → Full local user management
```

**How it works**:
- WorkOS only for initial authentication
- Create your own session tokens (JWT)
- Full user management in your database
- WorkOS just validates login, you do everything else

**Express Flow**:
```typescript
// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { code } = req.body; // From WorkOS OAuth callback

  // Exchange code for WorkOS token
  const { user: workosUser } = await workos.userManagement.authenticateWithCode({
    code,
    clientId: process.env.WORKOS_CLIENT_ID,
  });

  // Find or create local user
  let user = await prisma.user.findUnique({
    where: { email: workosUser.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: workosUser.email,
        firstName: workosUser.firstName,
        lastName: workosUser.lastName,
        role: 'USER', // You manage roles
      }
    });
  }

  // Create YOUR OWN JWT (not WorkOS)
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user });
});

// Your own auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

**Database Schema**:
```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  role            UserRole  @default(USER)

  // You manage everything
  organizationId  String?   @map("organization_id")
  avatarUrl       String?   @map("avatar_url")
  timezone        String    @default("UTC")
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization? @relation(fields: [organizationId], references: [id])

  @@map("users")
}

model Organization {
  id              String    @id @default(uuid())
  name            String
  slug            String    @unique // For subdomain
  users           User[]

  @@map("organizations")
}

enum UserRole {
  ADMIN
  MEMBER
  VIEWER
}
```

**Pros**:
- ✅ Full control over user data
- ✅ No external dependencies after login
- ✅ Complex role/permission logic
- ✅ Fast (no external API calls)
- ✅ Custom user features
- ✅ Can migrate away from WorkOS easily

**Cons**:
- ❌ You manage sessions/security
- ❌ More code to write/maintain
- ❌ WorkOS SSO harder to integrate
- ❌ Have to build user management UI
- ❌ Password resets, email verification, etc.
- ❌ Defeats purpose of using WorkOS

**Best for**: Apps that need total control (not recommended)

---

## Recommended Strategy: **Hybrid (Strategy B)**

For your use case, I recommend **Strategy B** because:

1. **Site 1 (Multi-tenant)**:
   - WorkOS manages organizations
   - Local DB stores org-specific data
   - Fast subdomain lookups

2. **Sites 2 & 3**:
   - Share same organization
   - Custom preferences per site
   - Fast user queries

3. **Session Sharing**:
   - WorkOS session cookies work across subdomains
   - Set cookie domain to `.app.com`

## Session Sharing Across Subdomains

### Cookie Configuration

```typescript
// When setting WorkOS session cookie
res.cookie('workos_session', sessionToken, {
  domain: '.yourapp.com',  // Works for all *.yourapp.com
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Cross-subdomain Flow

```
1. User logs in at org1.app.com
   → WorkOS creates session
   → Cookie set for .app.com

2. User navigates to dashboard.app.com
   → Cookie sent automatically
   → API validates session
   → User is authenticated ✅

3. User goes to analytics.app.com
   → Same cookie
   → Same session
   → Seamless experience ✅
```

## Implementation Plan

### Phase 1: Core Setup
- [ ] Set up WorkOS account
- [ ] Create organizations structure
- [ ] Configure auth endpoints
- [ ] Implement Strategy B middleware

### Phase 2: User Sync
- [ ] Create User model with workosId
- [ ] Set up WorkOS webhooks
- [ ] Implement webhook handlers
- [ ] Test sync scenarios

### Phase 3: Multi-tenancy (Site 1)
- [ ] Organization model
- [ ] Subdomain routing
- [ ] Role-based access control
- [ ] Organization-scoped queries

### Phase 4: Session Sharing
- [ ] Configure cookie domain
- [ ] Test cross-subdomain auth
- [ ] Handle org switching

Would you like me to create detailed implementation code for Strategy B?
