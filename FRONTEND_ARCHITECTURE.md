# Unit Spark Frontend Architecture

## Overview

TanStack Start monorepo with 3 separate applications sharing common packages.

## Technology Stack

- **Framework**: TanStack Start (SSR React framework)
- **State/Data**: TanStack Query (server state management)
- **Routing**: TanStack Router (type-safe routing)
- **Forms**: TanStack Form (type-safe forms)
- **Tables**: TanStack Table (powerful data tables)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Type Safety**: TypeScript (strict mode)
- **Monorepo**: pnpm workspaces
- **Build**: Vite
- **Deployment**: AWS Amplify or Vercel (per app)

## Project Structure

```
unitspark-frontend/
├── apps/
│   ├── platform/                    # Hiking & Camping sites
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── hiking/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── $slug.tsx
│   │   │   │   │   └── recommend.tsx
│   │   │   │   └── camping/
│   │   │   │       ├── index.tsx
│   │   │   │       ├── $slug.tsx
│   │   │   │       └── recommend.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── app.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── scout-org/                   # Multi-tenant org sites
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx        # Org home
│   │   │   │   ├── events/
│   │   │   │   ├── announcements/
│   │   │   │   ├── members/
│   │   │   │   └── settings/        # Org admin settings
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── app.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── admin/                       # Platform admin dashboard
│       ├── src/
│       │   ├── routes/
│       │   │   ├── __root.tsx
│       │   │   ├── index.tsx
│       │   │   ├── recommendations/ # Review queue
│       │   │   ├── content/         # Manage hikes/camping
│       │   │   ├── users/
│       │   │   └── organizations/
│       │   ├── components/
│       │   └── app.tsx
│       └── package.json
│
├── packages/
│   ├── ui/                          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                  # TanStack Query hooks
│   │   ├── src/
│   │   │   ├── queries/
│   │   │   │   ├── useHikes.ts
│   │   │   │   ├── useCampingSites.ts
│   │   │   │   ├── useOrganization.ts
│   │   │   │   └── useRecommendations.ts
│   │   │   ├── mutations/
│   │   │   │   ├── useCreateRecommendation.ts
│   │   │   │   ├── useUpdateHike.ts
│   │   │   │   └── useCreateEvent.ts
│   │   │   ├── client.ts            # Axios/Fetch client
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── organization.ts
│   │   │   ├── hike.ts
│   │   │   ├── camping.ts
│   │   │   ├── recommendation.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── auth/                        # WorkOS auth utilities
│   │   ├── src/
│   │   │   ├── WorkOSProvider.tsx
│   │   │   ├── useAuth.ts
│   │   │   ├── useOrganization.ts
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── utils/                       # Shared utilities
│       ├── src/
│       │   ├── formatters.ts
│       │   ├── validators.ts
│       │   ├── constants.ts
│       │   └── index.ts
│       └── package.json
│
├── package.json                     # Root package.json
├── pnpm-workspace.yaml
├── turbo.json                       # Turborepo config
├── tsconfig.json                    # Base TypeScript config
└── .gitignore
```

## App-Specific Details

### 1. Platform App (`apps/platform`)

**Purpose**: Serves both `hiking.unitspark.org` and `camping.unitspark.org`

**Routing Strategy**:
```typescript
// Detect subdomain and route accordingly
const subdomain = window.location.hostname.split('.')[0];

// Routes structure:
/                          → Home (detects hiking vs camping)
/trails or /sites          → List view (with filters)
/trails/:slug              → Detail view
/trails/:slug/recommend    → Submit recommendation
/recommend/new             → Suggest new trail/site
/profile                   → User profile
```

**Key Features**:
- Search & filter (TanStack Table)
- Map view (Mapbox/Leaflet)
- Recommendation forms (TanStack Form)
- Photo galleries
- User reviews/ratings

**Sample Route File** (`apps/platform/src/routes/hiking/$slug.tsx`):
```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useHike } from '@unitspark/api-client';
import { HikeDetail } from '../components/HikeDetail';

export const Route = createFileRoute('/hiking/$slug')({
  component: HikePage,
  loader: async ({ params }) => {
    // Prefetch data on server
    return { slug: params.slug };
  },
});

function HikePage() {
  const { slug } = Route.useParams();
  const { data: hike, isLoading } = useHike(slug);

  if (isLoading) return <div>Loading...</div>;

  return <HikeDetail hike={hike} />;
}
```

---

### 2. Scout Org App (`apps/scout-org`)

**Purpose**: Serves all Scout organization subdomains (`pack118.unitspark.org`, `troop42.unitspark.org`, etc.)

**Subdomain Detection**:
```typescript
// Middleware to fetch org based on subdomain
import { useOrganization } from '@unitspark/api-client';

function useCurrentOrg() {
  const subdomain = window.location.hostname.split('.')[0];
  return useOrganization(subdomain);
}
```

**Routing Strategy**:
```typescript
/                    → Org home
/events              → Events calendar
/events/:id          → Event detail
/announcements       → Announcements
/members             → Member directory (auth required)
/settings            → Org settings (admin only)
/settings/members    → Member management
/settings/billing    → Billing (if applicable)
```

**Key Features**:
- Event calendar (with RSVP)
- Announcements board
- Member directory
- Photo albums
- File sharing
- Org settings (admin)

**Sample Route File** (`apps/scout-org/src/routes/events/index.tsx`):
```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useEvents } from '@unitspark/api-client';
import { EventCalendar } from '../components/EventCalendar';

export const Route = createFileRoute('/events')({
  component: EventsPage,
});

function EventsPage() {
  const { data: organization } = useCurrentOrg();
  const { data: events, isLoading } = useEvents(organization.id);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{organization.name} Events</h1>
      <EventCalendar events={events} />
    </div>
  );
}
```

---

### 3. Admin App (`apps/admin`)

**Purpose**: Platform admin dashboard at `admin.unitspark.org`

**Access Control**:
```typescript
// Protect entire app
function AdminApp() {
  const { user } = useAuth();

  if (!user || !['CONTENT_REVIEWER', 'PLATFORM_ADMIN', 'SUPER_ADMIN'].includes(user.platformRole)) {
    return <Unauthorized />;
  }

  return <RouterProvider />;
}
```

**Routing Strategy**:
```typescript
/                           → Dashboard overview
/recommendations            → Review queue
/recommendations/:id        → Review detail
/content/hikes              → Manage hikes
/content/camping            → Manage camping sites
/users                      → User management
/organizations              → Scout org management
/analytics                  → Platform analytics
```

**Key Features**:
- Recommendation review queue (TanStack Table)
- Content management (CRUD)
- User management
- Organization management
- Analytics dashboards
- Audit logs

**Sample Route File** (`apps/admin/src/routes/recommendations/index.tsx`):
```typescript
import { createFileRoute } from '@tanstack/react-router';
import { usePendingRecommendations } from '@unitspark/api-client';
import { RecommendationTable } from '../components/RecommendationTable';

export const Route = createFileRoute('/recommendations')({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data: recommendations, isLoading } = usePendingRecommendations();

  return (
    <div>
      <h1>Pending Recommendations</h1>
      <RecommendationTable
        data={recommendations}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
```

## Shared Packages

### `packages/ui` - Component Library

**Built with**: shadcn/ui + Tailwind CSS

```typescript
// packages/ui/src/components/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Key Components**:
- Button, Input, Select, Checkbox, Radio
- Card, Modal, Dialog, Drawer
- Table, Pagination
- Form elements with validation
- Map components
- Calendar/Date picker

---

### `packages/api-client` - API Client with TanStack Query

```typescript
// packages/api-client/src/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.API_URL || 'https://api.unitspark.org',
  withCredentials: true, // Send cookies
});

// Request interceptor (add auth token if needed)
apiClient.interceptors.request.use((config) => {
  // WorkOS session cookie sent automatically
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/api/auth/login';
    }
    return Promise.reject(error);
  }
);
```

**Query Hooks**:
```typescript
// packages/api-client/src/queries/useHikes.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Hike, HikeFilters } from '@unitspark/types';

export function useHikes(filters?: HikeFilters) {
  return useQuery({
    queryKey: ['hikes', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Hike[]>('/api/hikes', {
        params: filters,
      });
      return data;
    },
  });
}

export function useHike(slug: string) {
  return useQuery({
    queryKey: ['hikes', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Hike>(`/api/hikes/${slug}`);
      return data;
    },
  });
}
```

**Mutation Hooks**:
```typescript
// packages/api-client/src/mutations/useCreateRecommendation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { RecommendationInput } from '@unitspark/types';

export function useCreateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecommendationInput) => {
      const response = await apiClient.post('/api/recommendations', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate recommendations cache
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
```

---

### `packages/auth` - WorkOS Auth Utilities

```typescript
// packages/auth/src/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@unitspark/api-client';
import type { User } from '@unitspark/types';

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<User>('/api/auth/me');
        return data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPlatformAdmin: user?.platformRole === 'PLATFORM_ADMIN' || user?.platformRole === 'SUPER_ADMIN',
    isSuperAdmin: user?.platformRole === 'SUPER_ADMIN',
  };
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
  });
}
```

**Protected Route Component**:
```typescript
// packages/auth/src/ProtectedRoute.tsx
import { useAuth } from './useAuth';
import { Navigate } from '@tanstack/react-router';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/api/auth/login" />;
  }

  return <>{children}</>;
}
```

---

### `packages/types` - Shared TypeScript Types

```typescript
// packages/types/src/hike.ts
export interface Hike {
  id: string;
  name: string;
  slug: string;
  description: string;
  summary?: string;
  trailhead: string;
  city?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  elevationGain?: number;
  difficulty?: Difficulty;
  routeType?: RouteType;
  coverImageUrl?: string;
  images?: string[];
  tags: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
export type RouteType = 'OUT_AND_BACK' | 'LOOP' | 'POINT_TO_POINT';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface HikeFilters {
  state?: string;
  difficulty?: Difficulty;
  minDistance?: number;
  maxDistance?: number;
  search?: string;
}
```

## Monorepo Configuration

### Root `package.json`

```json
{
  "name": "unitspark-frontend",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "dev:platform": "turbo run dev --filter=platform",
    "dev:scout-org": "turbo run dev --filter=scout-org",
    "dev:admin": "turbo run dev --filter=admin",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0"
  },
  "packageManager": "pnpm@8.10.0"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Deployment Strategy

### Per-App Deployment

Each app deploys independently:

| App | Domain | Deployment |
|-----|--------|------------|
| Platform | `hiking.unitspark.org`, `camping.unitspark.org` | Vercel/Amplify |
| Scout Org | `*.unitspark.org` | Vercel (wildcard subdomain) |
| Admin | `admin.unitspark.org` | Vercel/Amplify |

### Environment Variables (per app)

```bash
# All apps
VITE_API_URL=https://api.unitspark.org
VITE_WORKOS_CLIENT_ID=client_xxx

# Platform app
VITE_MAPBOX_TOKEN=pk.xxx

# Scout org app
VITE_ORG_FEATURES=events,announcements,calendar

# Admin app
VITE_ADMIN_FEATURES=analytics,audit-logs
```

## Development Workflow

```bash
# Install dependencies (root)
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev:platform
pnpm dev:scout-org
pnpm dev:admin

# Build all apps
pnpm build

# Type check all
pnpm type-check

# Lint all
pnpm lint
```

## Key Benefits of This Architecture

✅ **Type Safety**: End-to-end type safety with shared types package
✅ **Code Reuse**: Shared UI components, API hooks, auth logic
✅ **Developer Experience**: Run all apps with one command
✅ **Consistency**: Enforce design system across all sites
✅ **Performance**: TanStack Start SSR for better SEO and performance
✅ **Scalability**: Easy to add new apps or packages
✅ **Independent Deploys**: Each app can deploy independently

## Next Steps

1. **Scaffold the monorepo** structure
2. **Set up shared UI components** with shadcn/ui
3. **Create API client** with TanStack Query hooks
4. **Build platform app** (hiking/camping)
5. **Build scout org app** (multi-tenant)
6. **Build admin dashboard**
7. **Deploy to Vercel/Amplify**

Ready to start building? 🚀
