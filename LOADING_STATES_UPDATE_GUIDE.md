# Loading States Update - Complete Replacement Guide

## ✅ COMPLETED

1. **src/App.tsx** - Main app loader
2. **src/components/ProtectedLayout.tsx** - Protected route loader
3. **src/pages/SetupOrganization.tsx** - Organization setup
4. **src/pages/Collaborateurs.tsx** - Collaborators page (2 instances)
5. **src/pages/organisation/OrganisationDashboard.tsx** - Org dashboard
6. **src/pages/OrganisationRedirect.tsx** - Org redirect
7. **src/components/organisation/OrganisationRouteGuard.tsx** - Route guard
8. **src/components/organisation/OrganisationFlowWrapper.tsx** - Flow wrapper
9. **src/pages/Automatisations.tsx** - Automations page

## 🔄 TO UPDATE - Page Level Loaders (High Priority)

These should ALL use `<LoadingSpinner message="..." fullScreen />`:

### Pages (Simple "Chargement..." or similar):
```tsx
// Pattern: return <div>Chargement...</div>;
// Replace with: return <LoadingSpinner message="Chargement..." fullScreen />;
```

- [ ] src/pages/Ressources.tsx (line 13)
- [ ] src/pages/ProjectBusiness.tsx (line 420)
- [ ] src/pages/PlanActionPage.tsx (line 530)
- [ ] src/pages/ChatbotPage.tsx (line 269)
- [ ] src/pages/Partenaires.tsx (line 302)

### Organization Pages:
- [ ] src/pages/organisation/OrganisationForms.tsx (line 162)
- [ ] src/pages/organisation/OrganisationOnboarding.tsx (line 606-608)

### Components:
- [ ] src/components/deliverables/VisionMissionValeursLivrable.tsx (line 126)
- [ ] src/components/RoleBasedSidebar.tsx (line 452)

## 🎯 TO UPDATE - Centered Loading States

These use `<div className="animate-spin...">` and should use `<LoadingSpinner />`:

### Full Page Loaders:
```tsx
// Pattern: <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-COLOR"></div>
// Replace with: <LoadingSpinner message="Message..." />
```

- [ ] src/pages/Dashboard.tsx (line 111)
- [ ] src/pages/MyOrganization.tsx (lines 220, 270)
- [ ] src/pages/Outils.tsx (line 109)
- [ ] src/pages/PlanActionPage.tsx (lines 804, 813)
- [ ] src/pages/Project.tsx (line 29)
- [ ] src/pages/Roadmap.tsx (line 555)
- [ ] src/pages/member/IncubatorSpace.tsx (lines 219, 269)
- [ ] src/pages/organisation/OrganisationAnalytics.tsx (line 88)
- [ ] src/pages/organisation/OrganisationAnalyticsAdvanced.tsx (line 377)
- [ ] src/pages/organisation/OrganisationMentors.tsx (line 193)
- [ ] src/pages/organisation/OrganisationMentorProfile.tsx (line 258)
- [ ] src/pages/organisation/OrganisationAdherents.tsx (line 49)
- [ ] src/pages/organisation/OrganisationInvitations.tsx (line 128)
- [ ] src/pages/organisation/OrganisationLivrables.tsx (line 161)
- [ ] src/pages/organisation/OrganisationProfile.tsx (line 437)
- [ ] src/pages/organisation/OrganisationEntrepreneurs.tsx (line 78)
- [ ] src/pages/organisation/OrganisationProjets_OLD.tsx (line 99)
- [ ] src/pages/organisation/OrganisationSettings_OLD.tsx (line 149)
- [ ] src/components/actionplan/ActionPlanTestPage.tsx (line 29)

## ⚠️ KEEP AS-IS - Inline/Button Loaders

These are **Loader2** components used inside buttons and small UI elements.
**DO NOT REPLACE** these - they should stay as Loader2:

### Button Spinners (Keep Loader2):
- src/pages/UpdatePassword.tsx - Button loaders
- src/pages/AcceptInvitation.tsx - Loading states during processing
- src/pages/Partenaires.tsx - Button action loaders
- src/components/ui/avatar-upload.tsx - Upload progress
- src/components/ui/event-creation-modal.tsx - Save button
- src/components/ui/event-details-modal.tsx - Update button
- src/components/ui/recent-activities-list.tsx - Load more button
- src/components/resources/ResourceModalNew.tsx - Submit button
- src/components/automation/* - Various button states
- src/components/subscription/SubscriptionManager.tsx - Action buttons
- src/components/chat/ChatInput.tsx - Send button

### Refetch/Refresh Icons (Keep as-is):
- src/pages/VerifyEmail.tsx - Refresh button
- src/pages/ConfirmEmail.tsx - Refresh action
- src/pages/admin/EmailConfirmations.tsx - Refresh data
- src/pages/organisation/OrganisationSettings.tsx - Save button
- src/pages/organisation/OrganisationProfile.tsx - Save button
- src/pages/organisation/OrganisationAnalyticsAdvanced.tsx - Refresh button

### Special Loaders (Keep custom):
- src/pages/Login.tsx - Button spinner (white color specific)
- src/pages/ChatbotPage.tsx - Chat message loader (custom style)
- src/pages/organisation/OrganisationChatbot.tsx - Chat loader

## 📝 Implementation Pattern

### For Page-Level Loading:

```tsx
// Add import at top
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Replace loading check
if (loading) {
  return <LoadingSpinner message="Chargement..." fullScreen />;
}
```

### For Section/Card Loading:

```tsx
// Replace inline spinner
{loading ? (
  <LoadingSpinner message="Chargement des données..." />
) : (
  // Content
)}
```

### For Button Loading (KEEP Loader2):

```tsx
// DO NOT CHANGE - Keep as-is
<Button disabled={loading}>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

## 🎯 Priority Order

1. ✅ **DONE** - Core app and org pages
2. **HIGH** - User-facing pages (Ressources, ProjectBusiness, PlanAction, etc.)
3. **MEDIUM** - Organization admin pages
4. **LOW** - Old/deprecated pages (_OLD suffix)

## 🔍 Search Commands

To find remaining instances:

```bash
# Find "Chargement..." text
grep -r "Chargement\.\.\." src/pages src/components --include="*.tsx" --include="*.ts"

# Find animate-spin (exclude node_modules and dist)
grep -r "animate-spin" src/pages src/components --include="*.tsx" --include="*.jsx" | grep -v "Loader2"

# Find "Loading..." text  
grep -r "Loading\.\.\." src/pages src/components --include="*.tsx" --include="*.ts"
```

## ✅ Verification

After updates, verify:

1. No TypeScript errors
2. All imports added where needed
3. Loading states show proper messages
4. Full-screen loaders use `fullScreen` prop
5. Inline loaders use default or specify size
6. Button loaders still use Loader2 (not changed)

## 📊 Progress

- **Completed:** 9 files
- **To Update (High):** ~30 files
- **Keep As-Is:** ~30 files (button/inline loaders)

**Estimated remaining work:** 2-3 hours for all updates
