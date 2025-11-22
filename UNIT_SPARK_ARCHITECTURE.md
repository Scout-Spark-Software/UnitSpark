# Unit Spark Platform Architecture

## Overview

Unit Spark is a hybrid platform consisting of:
1. **Platform-owned content sites** (hiking, camping) with user-submitted recommendations
2. **Multi-tenant Scout organization sites** (packs, troops) with org-specific admins
3. **Unified authentication** across all sites via WorkOS

## Domain Structure

```
unitspark.org (Platform)
├── hiking.unitspark.org      (Platform - Hiking trails)
├── camping.unitspark.org     (Platform - Camping sites)
├── admin.unitspark.org       (Platform admin dashboard)
│
├── pack118.unitspark.org     (Scout Org - Cub Scout Pack 118)
├── troop42.unitspark.org     (Scout Org - Scouts BSA Troop 42)
├── crew99.unitspark.org      (Scout Org - Venturing Crew 99)
└── *.unitspark.org           (Any Scout organization)
```

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      WorkOS (Authentication)               │
│  - Single user accounts across all sites                   │
│  - Organization management for Scout orgs                  │
│  - SSO, role management                                    │
└─────────────────┬──────────────────────────────────────────┘
                  │
      ┌───────────┴───────────┬──────────────────┐
      │                       │                  │
┌─────▼──────┐    ┌──────────▼─────┐   ┌────────▼────────┐
│  Hiking    │    │    Camping     │   │ Scout Org Sites │
│  Platform  │    │    Platform    │   │ (Multi-tenant)  │
│            │    │                │   │                 │
│ hiking.    │    │  camping.      │   │ pack118.        │
│ unitspark  │    │  unitspark     │   │ troop42.        │
└─────┬──────┘    └────────┬───────┘   └────────┬────────┘
      │                    │                     │
      └────────────────────┼─────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Express   │
                    │     API     │
                    │  (Fargate)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Aurora    │
                    │ PostgreSQL  │
                    └─────────────┘
```

## User & Organization Model

### User Types

| User Type | Description | Access |
|-----------|-------------|--------|
| **Guest** | Not logged in | View public content only |
| **Platform User** | Registered user | Submit recommendations, view all platforms |
| **Org Member** | Member of Scout org | Access org content, basic features |
| **Org Admin** | Scout org admin | Manage org content, members, settings |
| **Content Reviewer** | Platform staff | Review hiking/camping recommendations |
| **Platform Admin** | Platform staff | Manage platform content, users |
| **Super Admin** | Platform staff | Access ANY org for support |

### Organization Types

```prisma
enum OrganizationType {
  PLATFORM      // Unit Spark platform (hiking, camping)
  PACK          // Cub Scout Pack
  TROOP         // Scouts BSA Troop
  CREW          // Venturing Crew
  SHIP          // Sea Scout Ship
  POST          // Exploring Post
}
```

### Role Hierarchy

**Platform Roles** (for hiking/camping sites):
```
SUPER_ADMIN > PLATFORM_ADMIN > CONTENT_REVIEWER > USER > GUEST
```

**Organization Roles** (for Scout org sites):
```
SUPER_ADMIN > ORG_OWNER > ORG_ADMIN > ORG_MEMBER > GUEST
```

## Database Schema

### Updated Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

model User {
  id              String    @id @default(uuid())
  workosId        String    @unique @map("workos_id")
  email           String    @unique
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")

  // Profile
  displayName     String?   @map("display_name")
  avatarUrl       String?   @map("avatar_url")
  bio             String?   @db.Text
  timezone        String    @default("UTC")
  preferences     Json?     // User preferences per site

  // Platform role (for hiking/camping sites)
  platformRole    PlatformRole @default(USER)

  // Status
  isActive        Boolean   @default(true) @map("is_active")
  lastLoginAt     DateTime? @map("last_login_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  organizationMemberships OrganizationMembership[]
  hikeRecommendations     HikeRecommendation[]
  campingRecommendations  CampingRecommendation[]
  notifications           Notification[]

  @@map("users")
  @@index([workosId])
  @@index([email])
  @@index([platformRole])
}

enum PlatformRole {
  GUEST
  USER
  CONTENT_REVIEWER
  PLATFORM_ADMIN
  SUPER_ADMIN
}

// ============================================================================
// ORGANIZATIONS (Scout Packs, Troops, etc.)
// ============================================================================

model Organization {
  id              String           @id @default(uuid())
  workosOrgId     String           @unique @map("workos_org_id")

  // Basic info
  name            String
  slug            String           @unique // pack118, troop42
  type            OrganizationType
  description     String?          @db.Text

  // Branding
  logoUrl         String?          @map("logo_url")
  bannerUrl       String?          @map("banner_url")
  primaryColor    String?          @map("primary_color")

  // Contact
  email           String?
  phone           String?
  website         String?

  // Location
  address         String?
  city            String?
  state           String?
  zipCode         String?          @map("zip_code")
  country         String           @default("US")

  // Settings
  settings        Json?            // Org-specific settings
  features        Json?            // Enabled features

  // Status
  isActive        Boolean          @default(true) @map("is_active")
  isPlatform      Boolean          @default(false) @map("is_platform") // true for Unit Spark platform org

  // Billing (for future)
  plan            String?          @default("free")
  billingEmail    String?          @map("billing_email")

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  memberships     OrganizationMembership[]
  events          Event[]
  announcements   Announcement[]

  @@map("organizations")
  @@index([workosOrgId])
  @@index([slug])
  @@index([type])
  @@index([isActive])
}

enum OrganizationType {
  PLATFORM
  PACK
  TROOP
  CREW
  SHIP
  POST
}

model OrganizationMembership {
  id              String           @id @default(uuid())
  userId          String           @map("user_id")
  organizationId  String           @map("organization_id")
  role            OrganizationRole @default(MEMBER)

  // Custom title in org
  title           String?          // "Cubmaster", "Scoutmaster", "Den Leader"

  // Status
  isActive        Boolean          @default(true) @map("is_active")
  joinedAt        DateTime         @default(now()) @map("joined_at")
  leftAt          DateTime?        @map("left_at")

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@map("organization_memberships")
  @@index([userId])
  @@index([organizationId])
  @@index([role])
}

enum OrganizationRole {
  MEMBER
  ADMIN
  OWNER
}

// ============================================================================
// PLATFORM CONTENT - HIKING
// ============================================================================

model Hike {
  id              String    @id @default(uuid())

  // Basic info
  name            String
  slug            String    @unique
  description     String    @db.Text
  summary         String?   // Short description

  // Location
  trailhead       String
  city            String?
  state           String?
  country         String    @default("US")
  latitude        Float?
  longitude       Float?

  // Trail details
  distance        Float?    // miles
  elevationGain   Float?    @map("elevation_gain") // feet
  difficulty      Difficulty?
  routeType       RouteType? @map("route_type")

  // Media
  coverImageUrl   String?   @map("cover_image_url")
  images          Json?     // Array of image URLs

  // Tags & features
  tags            String[]
  features        Json?     // Water sources, campsites, etc.

  // Status
  status          ContentStatus @default(PUBLISHED)
  isActive        Boolean       @default(true) @map("is_active")

  // Moderation
  reviewedBy      String?   @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  recommendations HikeRecommendation[]

  @@map("hikes")
  @@index([slug])
  @@index([state])
  @@index([difficulty])
  @@index([status])
}

model HikeRecommendation {
  id              String    @id @default(uuid())
  hikeId          String    @map("hike_id")
  userId          String    @map("user_id")

  // Recommendation type
  type            RecommendationType

  // Suggested changes
  fieldName       String?   @map("field_name") // Which field to update
  currentValue    String?   @map("current_value") @db.Text
  suggestedValue  String?   @map("suggested_value") @db.Text

  // Or suggest new hike
  suggestedData   Json?     @map("suggested_data")

  // Rationale
  notes           String?   @db.Text

  // Status
  status          RecommendationStatus @default(PENDING)
  reviewedBy      String?   @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")
  reviewNotes     String?   @map("review_notes") @db.Text

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  hike            Hike      @relation(fields: [hikeId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("hike_recommendations")
  @@index([hikeId])
  @@index([userId])
  @@index([status])
}

enum Difficulty {
  EASY
  MODERATE
  HARD
  VERY_HARD
}

enum RouteType {
  OUT_AND_BACK
  LOOP
  POINT_TO_POINT
}

// ============================================================================
// PLATFORM CONTENT - CAMPING
// ============================================================================

model CampingSite {
  id              String    @id @default(uuid())

  // Basic info
  name            String
  slug            String    @unique
  description     String    @db.Text
  summary         String?

  // Location
  address         String?
  city            String?
  state           String?
  country         String    @default("US")
  latitude        Float?
  longitude       Float?

  // Site details
  siteType        CampingSiteType? @map("site_type")
  capacity        Int?      // Number of people

  // Amenities
  amenities       Json?     // Restrooms, showers, water, etc.
  activities      String[]  // Hiking, fishing, swimming

  // Booking
  requiresReservation Boolean @default(false) @map("requires_reservation")
  reservationUrl  String?   @map("reservation_url")
  pricePerNight   Float?    @map("price_per_night")

  // Media
  coverImageUrl   String?   @map("cover_image_url")
  images          Json?

  // Status
  status          ContentStatus @default(PUBLISHED)
  isActive        Boolean       @default(true) @map("is_active")

  // Moderation
  reviewedBy      String?   @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  recommendations CampingRecommendation[]

  @@map("camping_sites")
  @@index([slug])
  @@index([state])
  @@index([siteType])
  @@index([status])
}

model CampingRecommendation {
  id              String    @id @default(uuid())
  campingSiteId   String    @map("camping_site_id")
  userId          String    @map("user_id")

  // Recommendation type
  type            RecommendationType

  // Suggested changes
  fieldName       String?   @map("field_name")
  currentValue    String?   @map("current_value") @db.Text
  suggestedValue  String?   @map("suggested_value") @db.Text

  // Or suggest new site
  suggestedData   Json?     @map("suggested_data")

  // Rationale
  notes           String?   @db.Text

  // Status
  status          RecommendationStatus @default(PENDING)
  reviewedBy      String?   @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")
  reviewNotes     String?   @map("review_notes") @db.Text

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  campingSite     CampingSite @relation(fields: [campingSiteId], references: [id], onDelete: Cascade)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("camping_recommendations")
  @@index([campingSiteId])
  @@index([userId])
  @@index([status])
}

enum CampingSiteType {
  CAMPGROUND
  RV_PARK
  BACKCOUNTRY
  GLAMPING
  CABIN
}

enum RecommendationType {
  UPDATE      // Suggest change to existing content
  NEW         // Suggest new content
  DELETE      // Suggest removal
}

enum RecommendationStatus {
  PENDING
  APPROVED
  REJECTED
  NEEDS_MORE_INFO
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ============================================================================
// SCOUT ORG FEATURES
// ============================================================================

model Event {
  id              String    @id @default(uuid())
  organizationId  String    @map("organization_id")

  // Event info
  title           String
  description     String?   @db.Text
  location        String?

  // Timing
  startDate       DateTime  @map("start_date")
  endDate         DateTime? @map("end_date")
  allDay          Boolean   @default(false) @map("all_day")

  // Event type
  eventType       EventType @map("event_type")

  // RSVP
  requiresRsvp    Boolean   @default(false) @map("requires_rsvp")
  maxAttendees    Int?      @map("max_attendees")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("events")
  @@index([organizationId])
  @@index([startDate])
}

enum EventType {
  MEETING
  CAMPOUT
  HIKE
  SERVICE_PROJECT
  COURT_OF_HONOR
  FUNDRAISER
  OTHER
}

model Announcement {
  id              String    @id @default(uuid())
  organizationId  String    @map("organization_id")

  title           String
  content         String    @db.Text
  priority        Priority  @default(NORMAL)

  // Publishing
  publishedAt     DateTime? @map("published_at")
  expiresAt       DateTime? @map("expires_at")

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("announcements")
  @@index([organizationId])
  @@index([publishedAt])
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

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

## Access Control Matrix

### Platform Sites (hiking.unitspark.org, camping.unitspark.org)

| Action | Guest | User | Content Reviewer | Platform Admin | Super Admin |
|--------|-------|------|------------------|----------------|-------------|
| View content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit recommendation | ❌ | ✅ | ✅ | ✅ | ✅ |
| Review recommendations | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit content | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete content | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ | ✅ |

### Scout Org Sites (pack118.unitspark.org, etc.)

| Action | Guest | Org Member | Org Admin | Org Owner | Super Admin |
|--------|-------|------------|-----------|-----------|-------------|
| View public pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| View org content | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post to org | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create events | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage members | ❌ | ❌ | ✅ | ✅ | ✅ |
| Org settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete org | ❌ | ❌ | ❌ | ❌ | ✅ |

## Subdomain Routing Logic

### Route Resolution

```typescript
// Pseudo-code for subdomain routing
function resolveSubdomain(req: Request) {
  const hostname = req.hostname; // e.g., "pack118.unitspark.org"
  const parts = hostname.split('.');

  // No subdomain or www
  if (parts.length <= 2 || parts[0] === 'www') {
    return { type: 'main', site: 'unitspark' };
  }

  const subdomain = parts[0];

  // Known platform subdomains
  if (subdomain === 'hiking') {
    return { type: 'platform', site: 'hiking' };
  }

  if (subdomain === 'camping') {
    return { type: 'platform', site: 'camping' };
  }

  if (subdomain === 'admin') {
    return { type: 'admin', site: 'platform' };
  }

  // Everything else is a Scout organization
  return { type: 'organization', slug: subdomain };
}
```

### Middleware Implementation

```typescript
// Subdomain middleware
export const subdomainMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { type, site, slug } = resolveSubdomain(req);

  if (type === 'organization') {
    // Look up organization
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org || !org.isActive) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    req.organization = org;
  }

  req.siteType = type;
  req.site = site || slug;

  next();
};
```

## Super Admin Access Pattern

### Impersonation for Support

```typescript
// Super admin can "enter" any organization for support
export const enterOrganization = async (req: Request, res: Response) => {
  // Verify user is super admin
  if (req.user?.platformRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { organizationId } = req.body;

  // Create temporary org membership
  const tempAccess = await prisma.organizationMembership.create({
    data: {
      userId: req.user.id,
      organizationId,
      role: 'ADMIN',
      title: 'Platform Support',
    },
  });

  // Log the access for audit
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'SUPER_ADMIN_ENTERED_ORG',
      entity: 'Organization',
      entityId: organizationId,
      metadata: { reason: req.body.reason },
    },
  });

  res.json({ success: true, access: tempAccess });
};
```

## Session Sharing Implementation

### Cookie Configuration

```typescript
// Set session cookie for all *.unitspark.org
res.cookie('workos_session', sessionToken, {
  domain: '.unitspark.org',  // Works for all subdomains
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Cross-subdomain User Flow

```
1. User logs in at hiking.unitspark.org
   → WorkOS authenticates
   → Cookie set for .unitspark.org
   → User lands on hiking site

2. User clicks link to their Scout pack
   → Navigates to pack118.unitspark.org
   → Same cookie sent automatically
   → API validates session
   → User sees pack118 content with Member role

3. User switches to camping.unitspark.org
   → Same cookie
   → Still authenticated
   → Sees camping site

4. User navigates to admin.unitspark.org
   → If they're a Content Reviewer or higher
   → Access granted to admin panel
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up WorkOS account with organizations
- [ ] Implement core database schema
- [ ] Create auth middleware with session sharing
- [ ] Build subdomain routing logic

### Phase 2: Platform Sites (Weeks 3-4)
- [ ] Hiking site: CRUD, search, filters
- [ ] Camping site: CRUD, search, filters
- [ ] Recommendation system
- [ ] Content review queue for admins

### Phase 3: Scout Org Sites (Weeks 5-7)
- [ ] Organization creation & subdomain provisioning
- [ ] Org admin dashboard
- [ ] Events calendar
- [ ] Announcements
- [ ] Member management

### Phase 4: Advanced Features (Weeks 8-10)
- [ ] Super admin tooling
- [ ] Audit logging
- [ ] Analytics dashboards
- [ ] Advanced search across all content
- [ ] Mobile app support

## Next Steps

Would you like me to:
1. **Create API endpoints** for hiking/camping recommendations?
2. **Build subdomain middleware** with org resolution?
3. **Design the super admin interface** architecture?
4. **Update the Express API structure** with this new schema?
5. **Create a frontend architecture** document for the 3 different site types?
