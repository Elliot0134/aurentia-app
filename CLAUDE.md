# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurentia is a multi-tenant SaaS platform: **Vite + React 18 + TypeScript + Supabase + Tailwind + ShadCN UI**. Supports 5 user roles (individual, member, staff, organisation, admin) with role-based routing. Features include project management, AI chatbots, deliverables tracking, messaging, knowledge bases, integrations, newsletters, and credit-based subscriptions.

## Common Commands

```bash
npm run dev              # Dev server on port 8080 (IPv6)
npm run build            # Production build
npm run build:dev        # Development build
npm run lint             # ESLint
npm run preview          # Preview build
```

## Design System Essentials

**Philosophy**: Centralized CSS variables in `/src/styles/theme.css` and reusable component classes in `/src/styles/components.css`. Supports light/dark modes and white-label branding.

### Key Colors
```css
Primary: #FF592C (--color-primary)
Text: #2e333d (--text-primary)
Background: #ffffff (--bg-page)
Cards: #f4f4f5 (--bg-card-clickable), #ffffff (--bg-card-static)
States: --color-success, --color-error, --color-warning, --color-info
```

### Typography
```css
--font-base: 'Inter', sans-serif           /* Body text, UI elements */
--font-heading: 'BIZUD Mincho', serif      /* H1 ONLY (page titles) */
```
**Critical**: H1 uses BIZUD Mincho (page titles only), everything else uses Inter. Body text is 16px (prevents mobile zoom on input focus).

### Essential Component Classes
```css
.btn-primary, .btn-secondary, .btn-danger, .btn-white-label
.card-clickable, .card-static
.input, .input-error, .checkbox, .checkbox-white-label
.modal, .modal-overlay, .dropdown, .tabs, .badge
.spinner, .skeleton, .loading-shimmer
```

### White-Label System
Organizations can override Aurentia colors when:
1. On `/organisation/*` routes
2. `settings.branding.whiteLabel: true`
3. Custom `primaryColor` and `secondaryColor` defined

CSS variables injected: `--org-primary-color`, `--org-secondary-color` (automatically override `--color-primary`). Use `.btn-white-label`, `.checkbox-white-label` for org-branded components.

## Architecture

### Auth Flow (ProtectedRoute checks)
1. Session validity (5s timeout)
2. Email confirmation (`email_confirmed_at`)
3. Beta access (`has_beta_access` flag)
4. Redirects to `/verify-email` or `/beta-inscription` if needed

**Critical**: Singleton Supabase client at `/src/integrations/supabase/client.ts` prevents multiple GoTrueClient instances.

**Auth Events**: `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED` handled. `INITIAL_SESSION` **ignored** to prevent loops.

### Role System
```typescript
type UserRole = 'individual' | 'member' | 'staff' | 'organisation' | 'admin';

// individual - Standalone users with projects
// member - Entrepreneurs/clients in organization
// staff - Organization employees (can also be mentors)
// organisation - Organization owners
// admin - Platform administrators
```

### Context Hierarchy (CRITICAL - Non-obvious!)
```
ErrorBoundary
└─ QueryClientProvider (5min stale, 10min gc, no refetch on focus)
   └─ BrowserRouter
      └─ UserProvider (profile, role, organizationId, refetchProfile)
         └─ ProjectProvider (currentProjectId, userProjects, deliverableNames, userCredits)
            └─ ChatStreamingProvider (real-time chat streaming)
               └─ VoiceQuotaProvider (audio quota tracking)
                  └─ CreditsDialogProvider
                     └─ PendingInvitationsProvider
                        └─ DeliverablesLoadingProvider (progressive loading state)
```

**UserContext** features:
- Fetches `profiles` + joins `user_organizations` + `organizations`
- Concurrent fetch prevention via `fetchInProgressRef`
- 3s timeout protection
- Handles auth events (ignores `INITIAL_SESSION`)

**ProjectContext** features:
- `currentProjectId` persisted to localStorage
- Loads owned + collaborated projects
- Auto-selects first project if none selected
- Validates `currentProjectId` when projects change
- n8n webhook for RAG deletion on project delete

### Route Guards
```tsx
<ProtectedRoute>            // Session + email + beta
<OrganisationRouteGuard>    // Org membership (supports requireOwner prop)
<RestrictedRouteGuard>      // Beta/restricted features
<EmailConfirmationGuard>    // Email verification
<ProjectRequiredGuard>      // Ensures project selected
<RootRedirect>              // OAuth callback + role-based routing
```

## Database Patterns

### RLS (Row Level Security)
All tables have RLS enabled. **Error handling**:
- `403` = Permission denied (user lacks access)
- `404` = Wrong table/missing data (or RLS blocked)

### Core Table Groups
**Auth & Users**: `profiles`, `beta_users`, `email_confirmations`, `email_confirmation_logs`, `user_activity_log`

**Organizations**: `organizations`, `user_organizations`, `staff`, `mentors`, `mentor_assignments`, `partners`, `invitation_codes`

**Projects**: `project_summary`, `project_collaborators`, `project_invitations`, `deliverables`, 13+ individual deliverable tables (persona_express_b2c, pitch, marche, etc.)

**Messaging** (20251019000000): `conversations`, `conversation_participants`, `conversation_messages`, `resource_shares`

**Knowledge Base** (20251020000000): `project_knowledge_base` (50MB/file), `organization_knowledge_base` (100MB/file), `knowledge_base_storage_usage`

**Integrations** (20251021000000): `integrations`, `integration_webhooks`, `integration_api_keys`, `integration_logs` (30-day retention)

**Events**: `events`, `organizations.event_type_colors` (JSONB)

**Stripe**: `payment_intents`, `subscription_intents`, `stripe_customers`, `stripe_subscriptions`, `stripe_webhook_events`

### Common Patterns
- `created_at`, `updated_at` timestamps
- Soft delete with `deleted_at`
- Auto-cleanup triggers
- JSONB for settings (`organizations.settings`, `organizations.event_type_colors`)
- UUID primary keys
- CASCADE deletes on foreign keys

### Storage Buckets
```
knowledge-base-files        # Individual KBs (50MB/file)
org-knowledge-base-files    # Organization KBs (100MB/file)
resource-files              # Platform resources
avatars                     # User avatars
audio-storage               # Audio files
```

## Key Development Patterns

### Concurrent Fetch Prevention
```typescript
const fetchInProgressRef = useRef(false);

if (fetchInProgressRef.current) return;
fetchInProgressRef.current = true;
try {
  // fetch logic
} finally {
  fetchInProgressRef.current = false;
}
```

### Mounted Ref Pattern
```typescript
const mountedRef = useRef(true);

useEffect(() => {
  return () => { mountedRef.current = false; };
}, []);

// In async functions:
if (!mountedRef.current) return;
```

### Supabase Best Practices
- Always import from `@/integrations/supabase/client` (singleton)
- Use `.select().eq()` query builders (not raw SQL except in migrations)
- Apply RLS policies in migrations
- Wrap async calls in try/catch with toast notifications
- Handle RLS errors: 403 = permission issue, 404 = wrong table/missing data

### Error Handling
- Always provide loading, error, and empty states
- Use `import { toast } from '@/components/ui/use-toast'` for user feedback
- Log errors to console with context
- Never expose sensitive error details to users

### Code Style
- **TypeScript**: Prefer explicit types, avoid `any`
- **Imports**: Always use `@/` alias
- **Components**: PascalCase `.tsx` files
- **Hooks**: `use{FeatureName}.tsx` naming
- **Services**: Lowercase `.ts` extension
- Prefer ShadCN primitives over custom Tailwind
- Use design system classes (`.btn-primary`, `.card-clickable`) over custom styles

## Important Notes

1. **Email + Beta required**: New users need email confirmation AND beta access to use platform
2. **Port 8080**: Dev server runs on port 8080 with IPv6 (`::`), not 5173
3. **Project persistence**: `currentProjectId` saved to localStorage
4. **Singleton client**: Supabase client must be imported from `/src/integrations/supabase/client` to prevent multiple GoTrueClient instances
5. **Design system**: Always use CSS variables from `/src/styles/theme.css`, never hardcode colors
6. **White-label**: Automatically overrides Aurentia colors when enabled in org settings
7. **Input font size**: 16px prevents mobile zoom on focus
8. **Progressive loading**: `DeliverablesLoadingContext` coordinates element-by-element reveals with fadeInUp/fadeInBlur animations
9. **React Query**: 5min stale time, 10min gc, no refetch on window focus
10. **RLS**: Handle 403/404 errors appropriately - not all "not found" errors are actual 404s
