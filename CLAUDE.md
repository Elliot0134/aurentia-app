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
                  └─ DeliverablesLoadingProvider (progressive loading state)
```

**DeliverablesLoadingContext** (`/src/contexts/DeliverablesLoadingContext.tsx`):
- Manages progressive loading state for deliverable cards
- `registerDeliverable(id)`: Register a deliverable that needs to load
- `setDeliverableLoaded(id)`: Mark a deliverable as loaded
- `isGlobalLoading`: Boolean indicating if any deliverables are still loading
- Used for element-by-element progressive loading animations with blur effects

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

### UI Components & Design System

**Component Library**: ShadCN UI components in `/src/components/ui/`

**Aurentia Design System**: Centralized design tokens and components
- **Theme Variables**: `/src/styles/theme.css` defines all design tokens (colors, typography, spacing, animations)
- **Component Utilities**: `/src/styles/components.css` provides reusable component classes with `@apply` directives
- **Import Order**: Both files imported in `/src/index.css` and applied via `@layer` directives

**Design Token Usage**:
- Colors: Use CSS variables like `var(--text-primary)`, `var(--bg-card-clickable)`, `var(--btn-primary-bg)`
- Typography: H1 uses 'BIZUD Mincho' serif font (page titles only), all other text uses 'Inter' sans-serif
- Spacing: Use `var(--spacing-4)`, `var(--spacing-8)`, etc.
- Border Radius: Use `var(--radius-md)`, `var(--radius-lg)`, etc.
- Transitions: Use `var(--transition-base)` with `var(--ease-default)`

**Component Classes** (from `components.css`):
- Cards: `.card-clickable`, `.card-static`, `.deliverable-card`, `.project-card`
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-tertiary`, `.btn-danger`, `.btn-loading`
- Forms: `.input`, `.input-error`, `.input-label`
- Loading: `.spinner`, `.skeleton`, `.spinner-container`
- Modals: `.modal`, `.modal-overlay`, `.modal-close`
- Chat: `.chat-bubble-user`, `.chat-bubble-ai`, `.chat-input`

**Styling Best Practices**:
- Prefer design system classes over custom Tailwind when available
- Use `cn()` helper from `/src/lib/utils` for conditional classes
- Mobile-first responsive design with breakpoints
- Path alias: `@/` maps to `/src/`

**Key UI Patterns**:
- Toast notifications: `import { toast } from '@/components/ui/use-toast'`
- Loading states: `<LoadingSpinner message="..." fullScreen />` or use skeleton classes
- Empty states and error handling required in all data-fetching components
- Progressive loading animations: `fadeInUp`, `fadeInBlur` keyframes available

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
- `/enhance`: Enhance existing features
- `/ui-polish`: UI/UX improvements
- `/doc`: Documentation tasks
- `/plan-flow`: Plan multi-step workflows
- `/review`: Code review
- `/refactor`: Code refactoring
- `/test`: Testing tasks
- `/migrate`: Database migration tasks

## White-Label Branding System

**Organization Color Overrides**: When white-label branding is enabled in organization settings, the platform dynamically applies organization colors:
- CSS Variables: `--org-primary-color`, `--org-secondary-color`, `--org-primary-rgb`, `--org-secondary-rgb`
- Tailwind Config: `primary` and `secondary` colors use `var(--color-primary)` and `var(--color-secondary)`
- Override Classes: `.org-bg-primary`, `.org-text-primary`, `.org-border-primary`, `.org-gradient-primary`
- Automatic Replacement: Utility selectors in `index.css` replace all Aurentia pink/orange colors with org colors when `[style*="--org-primary-color"]` is detected
- Checkboxes: Automatically styled with organization colors via `accent-color` CSS property

**White-Label Conditions** (all must be true):
1. User is in `/organisation/*` routes
2. White-label setting enabled in organization settings
3. Organization has custom logo and name configured

## Important Notes

- Email confirmation required for new users (see `EmailConfirmationGuard`)
- Project selector persists to localStorage as `currentProjectId`
- Auth state managed via singleton Supabase client to prevent multiple GoTrueClient instances
- Organization routes require active organization membership
- Deliverables are loaded on-demand when `currentProjectId` changes
- Development server runs on port 8080 by default
- Design system tokens defined in `/src/styles/theme.css` - always use CSS variables over hardcoded values
- Progressive loading animations use `DeliverablesLoadingContext` for coordinated element-by-element reveals
