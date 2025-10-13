# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurentia is a multi-tenant platform built with Vite + React + TypeScript + Supabase + ShadCN UI + Tailwind. It supports multiple user roles (individual, member, staff, organisation, super_admin) with role-based navigation and features. The platform provides project management tools, AI-powered chatbots, deliverables tracking, organization management, and credit-based subscriptions.

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 8080

# Build
npm run build            # Production build
npm run build:dev        # Development build

# Linting
npm run lint             # Run ESLint

# Preview
npm run preview          # Preview production build
```

## Architecture

### Authentication & User Management

- **Supabase Auth**: Singleton client at `/src/integrations/supabase/client.ts`
- **Auth Flow**: Protected routes use `<ProtectedRoute>` which checks session and email verification status
- **User Context**: `/src/contexts/UserContext.tsx` provides `userProfile`, `userRole`, `organizationId`, and `refetchProfile()`
- **Email Verification**: Required for new users; redirects to `/verify-email` if not confirmed

### Multi-Tenant & Role System

**User Roles** (defined in `/src/types/userTypes.ts`):
- `individual`: Standalone users with their own projects
- `member`: Entrepreneurs/clients within an organization
- `staff`: Organization employees with admin privileges
- `organisation`: Organization owners/main admins
- `super_admin`: Platform administrators

**Role-Based Routing**:
- Individual routes: `/individual/*`
- Organization routes: `/organisation/:id/*` (protected by `<OrganisationRouteGuard>`)
- Super admin routes: `/super-admin/*`
- All protected routes wrapped in `<RoleBasedLayout>` which renders `<RoleBasedSidebar>`

**Navigation**: `RoleBasedRedirect` component handles automatic redirects based on user role

### Context Providers

**Provider Hierarchy** (from `App.tsx`):
```
QueryClientProvider
└─ TooltipProvider
   └─ BrowserRouter
      └─ UserProvider (user profile, role, organization)
         └─ ProjectProvider (projects, deliverables, credits)
            └─ CreditsDialogProvider
               └─ PendingInvitationsProvider
```

**ProjectContext** (`/src/contexts/ProjectContext.tsx`):
- Manages `currentProjectId` (persisted to localStorage)
- Provides `userProjects`, `deliverableNames`, `userCredits`
- Methods: `loadUserProjects()`, `deleteProject()`, `loadUserCredits()`

### Data Layer

**Supabase Client**: Always import from `@/integrations/supabase/client` (singleton pattern)

**React Query**: Configured with 5min staleTime, 10min gcTime, no window refocus

**Common Patterns**:
- Services in `/src/services/` (e.g., `organisationService.ts`, `stripeService.ts`)
- Custom hooks in `/src/hooks/` (e.g., `useUserRole`, `useOrganisationData`)
- Types in `/src/types/` (e.g., `userTypes.ts`, `organisationTypes.ts`)

### UI Components

**Component Library**: ShadCN UI components in `/src/components/ui/`

**Styling**: Tailwind CSS with mobile-first responsive design
- Use `cn()` helper from `/src/lib/utils` for conditional classes
- Path alias: `@/` maps to `/src/`

**Key UI Patterns**:
- Toast notifications: `import { toast } from '@/components/ui/use-toast'`
- Loading states: `<LoadingSpinner message="..." fullScreen />`
- Empty states and error handling required in all data-fetching components

### Deliverables System

**Deliverable Types** (configured in ProjectContext):
- Cible B2C (`persona_express_b2c`)
- Cible B2B (`persona_express_b2b`)
- Cible Organismes (`persona_express_organismes`)
- Pitch (`pitch`)
- Concurrence (`concurrence`)
- Marché (`marche`)
- Proposition de valeur (`proposition_valeur`)
- Business Model (`business_model`)
- Analyse des ressources (`ressources_requises`)
- Vision/Mission (`vision_mission`)

Each deliverable has a dedicated Supabase table linked to `project_id` and `user_id`.

### Credits & Subscription System

- Credit tracking via `useCreditsSimple` hook
- Stripe integration services: `stripeService.ts`, `aurentiaStripeService.ts`
- Credit dialog context for purchase flows
- User subscription status in profile

## Development Guidelines

### Code Style

- **TypeScript**: Strict types (note: `noImplicitAny: false` in tsconfig but prefer explicit types)
- **Imports**: Always use `@/` alias for imports
- **Components**: PascalCase `.tsx` files
- **Hooks**: `use{FeatureName}.tsx` naming convention
- **Services**: Lowercase with `.ts` extension

### Supabase Patterns

- Use `.select().eq()` query builders, not raw SQL
- Apply RLS policies in migrations
- Handle RLS errors (403 = permission issue, 404 = wrong table/missing data)
- Wrap async Supabase calls in try/catch with user-friendly toast messages

### Error Handling

- Always provide loading, error, and empty states
- Use toast notifications for user feedback
- Log errors to console with descriptive context
- Avoid exposing sensitive error details to users

### Component Patterns

- Prefer ShadCN primitives over custom Tailwind components
- Mobile-first responsive design
- Use React Query for data fetching (`useQuery`, `useMutation`)
- Avoid `any` and `// @ts-ignore`

## Organization Features

**Organization Pages** (`/src/pages/organisation/`):
- Dashboard: Overview and analytics
- Adherents: Member management
- Projets: Project tracking for members
- Livrables: Deliverables across all projects
- Invitations: Invite code management
- Forms: Custom form builder
- Evenements: Calendar and event management
- Mentors: Mentor assignment system
- Settings: White-label branding, notifications

**Organization Context**: Use `useOrganisationData` hook for organization-specific data

## Key Integrations

- **Supabase**: Database, auth, edge functions
- **Stripe**: Payments and subscriptions
- **Google Maps**: Address autocomplete (`@googlemaps/js-api-loader`)
- **FullCalendar**: Event calendar (`@fullcalendar/react`)
- **Chart.js**: Analytics charts (`chart.js`, `react-chartjs-2`)
- **n8n Webhooks**: External automation triggers (e.g., RAG deletion at `n8n.srv906204.hstgr.cloud`)

## Slash Commands

Custom commands available in `.claude/commands/`:
- `/feature`: Add new feature with proper structure
- `/fix`: Debug and resolve issues
- `/ui-polish`: UI/UX improvements
- `/doc`: Documentation tasks
- `/plan-flow`: Plan multi-step workflows
- `/review`: Code review
- `/refactor`: Code refactoring

## Important Notes

- Email confirmation required for new users (see `EmailConfirmationGuard`)
- Project selector persists to localStorage
- Auth state managed via singleton Supabase client to prevent multiple GoTrueClient instances
- Organization routes require active organization membership
- White-label support via organization settings (custom colors, logo)
