# Onboarding Feature

## Overview
Complete onboarding flow for new Aurentia users with smooth animations and modern UX.

## Features

### Multi-step Flow
1. **Theme Selection** - Choose between light/dark themes
2. **Personal Information** - Name, birth date, preferred language
3. **Discovery Source** - How did you hear about Aurentia?
4. **User Type** - Entrepreneur, Dreamer, or Support Structure
5. **Goals Selection** - Personalized based on user type
6. **Plan Selection** - Free or Accessible plan (for entrepreneurs/dreamers only)

### Key Characteristics
- **Clean Layout**: No navbar, sidebar, or distractions
- **Smooth Animations**: Framer Motion for fluid transitions
- **Conditional Logic**: Dynamic steps based on user type
- **Progress Indicator**: Animated dots showing current step
- **Data Persistence**: Saves to Supabase profiles table
- **Auto-redirect**: New users without projects automatically redirected

## Implementation Details

### Files Created
```
src/
├── components/onboarding/
│   ├── OnboardingFlow.tsx          # Main flow orchestrator
│   ├── ProgressDots.tsx             # Progress indicator
│   └── slides/
│       ├── ThemeSelection.tsx       # Step 1
│       ├── PersonalInfo.tsx         # Step 2
│       ├── DiscoverySource.tsx      # Step 3
│       ├── UserTypeSelection.tsx    # Step 4
│       ├── GoalsSelection.tsx       # Step 5
│       └── PlanSelection.tsx        # Step 6
├── pages/
│   └── Onboarding.tsx               # Clean page wrapper
├── types/
│   └── onboarding.ts                # TypeScript types
├── hooks/
│   └── useOnboardingStatus.ts       # Check completion status
```

### Files Modified
- `src/App.tsx` - Added /onboarding route
- `src/pages/Dashboard.tsx` - Redirect logic for new users
- `src/components/RoleBasedRedirect.tsx` - Whitelist onboarding path

### Database Changes
```sql
-- Migration: supabase/migrations/20250122_add_onboarding_fields.sql
ALTER TABLE profiles ADD COLUMN:
- onboarding_completed (boolean)
- onboarding_data (jsonb)
- theme_preference (text)
- preferred_language (text)
```

### Dependencies Added
- `framer-motion` - For smooth, modern animations

## Design Patterns

### Animations
- **Slide transitions**: Smooth horizontal slides between steps
- **Element entrance**: Staggered fade-in with delays
- **Hover effects**: Scale and shadow changes
- **Selection feedback**: Scale pulse on selection
- **Progress dots**: Scale animation on active step

### Colors
- **Primary**: `#FF6B35` (Aurentia orange)
- **Background**: Clean white
- **Text**: Gray scale for hierarchy
- **Rings**: Orange for selection, gray for default

### Responsive
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly targets
- Readable typography at all sizes

## User Flow

### For New Users
1. Sign up → Email verification
2. Auto-redirect to `/onboarding`
3. Complete 5-6 steps (based on user type)
4. Data saved to profile
5. Redirect to `/individual/dashboard`

### For Returning Users
- If `onboarding_completed = true`: Normal dashboard access
- If `onboarding_completed = false` AND no projects: Redirect to onboarding

## Testing

### Manual Testing Steps
1. Create new account
2. Verify email
3. Should auto-redirect to onboarding
4. Complete all steps
5. Verify redirect to dashboard
6. Check profile in Supabase for saved data

### Edge Cases Tested
- User with projects but no onboarding: Dashboard access
- User navigating back during onboarding: All data preserved
- User refreshing during onboarding: Current step restored
- Structure users: No plan selection step (5 steps total)

## Future Enhancements
- [ ] Skip onboarding option (save as "skipped")
- [ ] Edit onboarding data from profile settings
- [ ] Analytics on onboarding completion rates
- [ ] A/B testing different flows
- [ ] Personalized dashboard based on goals
- [ ] Email follow-ups based on selected goals

## Notes
- Onboarding can be bypassed by creating a project first
- Theme preference immediately applies to UI
- All data stored in JSONB for flexibility
- Migration is additive (safe to run on existing DB)
