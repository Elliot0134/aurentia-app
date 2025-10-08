# Public Organizations Discovery - Visual Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEW USER SIGNUP                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   Individual              Organisation
                     User                     Role User
                        │                       │
                        ▼                       ▼
         ┌──────────────────────┐   ┌──────────────────────┐
         │ Fill Signup Form:    │   │ Fill Signup Form:    │
         │ - Name               │   │ - Name               │
         │ - Email              │   │ - Email              │
         │ - Phone              │   │ - Phone              │
         │ - 📍 ADDRESS (NEW)   │   │ - 📍 ADDRESS (NEW)   │
         │ - Password           │   │ - Password           │
         └──────────────────────┘   └──────────────────────┘
                        │                       │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  Confirm Email       │
                        └──────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   Individual              Organisation
                        │                       │
                        ▼                       ▼
         ┌──────────────────────┐   ┌──────────────────────┐
         │  Login to App        │   │  Login to App        │
         └──────────────────────┘   └──────────────────────┘
                        │                       │
                        │                       ▼
                        │            ┌──────────────────────┐
                        │            │ 🎉 SETUP GUIDE       │
                        │            │    MODAL APPEARS     │
                        │            │ (One-time only)      │
                        │            └──────────────────────┘
                        │                       │
                        │            ┌──────────┴──────────┐
                        │            │                     │
                        │       "Créer mon          "Plus tard"
                        │      organisation"              │
                        │            │                     │
                        │            ▼                     │
                        │   /organisation/onboarding      │
                        │                                 │
                        │◄────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────────────┐
         │         DASHBOARD VIEW                        │
         │                                               │
         │  Sidebar shows:                              │
         │  ┌─────────────────────────────────┐         │
         │  │ 🏢 Rejoindre une organisation   │         │
         │  │    (Button in pink)              │         │
         │  └─────────────────────────────────┘         │
         └──────────────────────────────────────────────┘
                        │
                    Click Button
                        │
                        ▼
         ┌──────────────────────────────────────────────┐
         │   🎯 PUBLIC ORGANIZATIONS MODAL               │
         │                                               │
         │  ┌────────────────────────────────────┐      │
         │  │  Search: [____________]  🔍         │      │
         │  └────────────────────────────────────┘      │
         │                                               │
         │  ┌────────────────────────────────────┐      │
         │  │ ☑️ Afficher uniquement les          │      │
         │  │    organisations proches            │      │
         │  │    Rayon: ─●───────  100 km        │      │
         │  └────────────────────────────────────┘      │
         │                                               │
         │  ┌────────────────────────────────────┐      │
         │  │  📸 Banner Image                    │      │
         │  │  ┌────┐                             │      │
         │  │  │Logo│  Organization Name          │      │
         │  │  └────┘  Type • Location            │      │
         │  │          Description...             │      │
         │  │                  [Postuler →]       │      │
         │  └────────────────────────────────────┘      │
         │                                               │
         │  ┌────────────────────────────────────┐      │
         │  │  Organization 2...                  │      │
         │  └────────────────────────────────────┘      │
         │                                               │
         │  ┌────────────────────────────────────┐      │
         │  │  Organization 3...                  │      │
         │  └────────────────────────────────────┘      │
         │                                               │
         │              [Fermer]                         │
         └──────────────────────────────────────────────┘
                        │
                    Click "Postuler"
                        │
                        ▼
         ┌──────────────────────────────────────────────┐
         │  ✅ APPLICATION CREATED                       │
         │                                               │
         │  Database: organisation_applications          │
         │  - user_id: current user                     │
         │  - organization_id: selected org             │
         │  - status: "pending"                         │
         │  - created_at: now()                         │
         │                                               │
         │  Toast: "Candidature envoyée ! 🎉"           │
         └──────────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────────────┐
         │  🔄 CURRENT BEHAVIOR: MOCKED                  │
         │                                               │
         │  Application is tracked but not approved     │
         │  User receives toast notification only       │
         │                                               │
         │  📝 FUTURE: Organization admin will see      │
         │     application in their dashboard and       │
         │     can approve/reject it                    │
         └──────────────────────────────────────────────┘
```

## Database Schema Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                  │
└────────────────────────────────────────────────────────────────┘

    Signup Form                 Profiles Table
         │                            │
         │  Name, Email,             │  id (uuid)
         │  Phone, 📍 Address  ──────►  email
         │                            │  first_name
         │                            │  last_name
         │                            │  phone
         │                            │  📍 address (NEW)
         │                            │  user_role
         │                            │  organization_id
         │                            
         │
         │                      Organizations Table
         │                            │
    User Browses  ────────────────────►  id (uuid)
    Public Orgs                        │  name
         │                            │  description
         │                            │  📍 address
         │                            │  logo_url
         │                            │  banner_url
         │                            │  ✅ is_public = true
         │                            │  ✅ onboarding_completed = true
         │
         │
    User Applies              Organisation_Applications Table (NEW)
         │                            │
         └────────────────────────────►  id (uuid)
                                      │  user_id (FK → auth.users)
                                      │  organization_id (FK → organizations)
                                      │  status (pending/approved/rejected)
                                      │  message (optional)
                                      │  created_at
                                      │  reviewed_at
                                      │  reviewed_by (FK → profiles)
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT TREE                               │
└────────────────────────────────────────────────────────────────┘

App.tsx
  │
  ├─ Signup.tsx
  │    └─ [Form with address field] 📍
  │
  └─ RoleBasedSidebar.tsx
       │
       ├─ Desktop Sidebar
       │    └─ Menu Items
       │         └─ "Rejoindre une organisation" button
       │              │
       │              └─ onClick → setPublicOrgsModalOpen(true)
       │
       ├─ Mobile Navbar
       │    └─ Menu Items
       │         └─ "Rejoindre une organisation" button
       │              │
       │              └─ onClick → setPublicOrgsModalOpen(true)
       │
       ├─ 🆕 PublicOrganizationsModal
       │    │  Props: isOpen, onClose, userAddress
       │    │
       │    ├─ Search Input
       │    ├─ Proximity Filter (if userAddress exists)
       │    │    └─ Distance Slider (50-200km)
       │    │
       │    └─ Organization Cards
       │         ├─ Banner Image
       │         ├─ Logo
       │         ├─ Name, Type, Description
       │         ├─ Address, Geographic Focus
       │         └─ "Postuler" Button
       │              │
       │              └─ handleApply()
       │                   └─ Create record in organisation_applications
       │
       └─ 🆕 OrganizationSetupGuideModal
            │  Props: isOpen, onClose, onStartSetup
            │  Shown: When user_role === 'organisation' && !organization_id
            │  Frequency: Once (tracked in localStorage)
            │
            ├─ Guide Content
            │    └─ 3-step process explanation
            │
            └─ Action Buttons
                 ├─ "Créer mon organisation" → navigate('/organisation/onboarding')
                 └─ "Plus tard" → dismiss (localStorage flag)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    STATE FLOW                                   │
└────────────────────────────────────────────────────────────────┘

RoleBasedSidebar Component State:
  │
  ├─ publicOrgsModalOpen: boolean
  │    └─ Controls PublicOrganizationsModal visibility
  │
  ├─ showOrgSetupGuide: boolean
  │    └─ Controls OrganizationSetupGuideModal visibility
  │         └─ Checked on mount:
  │              if (userRole === 'organisation' && !organizationId)
  │                 && !localStorage.getItem(`org_setup_guide_seen_${userId}`)
  │
  └─ userProfile: UserProfile
       └─ Contains: address, user_role, organization_id

PublicOrganizationsModal Component State:
  │
  ├─ organizations: Organization[]
  │    └─ Fetched from Supabase on mount
  │
  ├─ filteredOrganizations: Organization[]
  │    └─ Filtered by search and proximity
  │
  ├─ searchTerm: string
  ├─ showNearbyOnly: boolean
  ├─ distanceFilter: number (km)
  └─ applyingToOrgId: string | null
       └─ Loading state for apply button
```

## Security & Permissions

```
┌────────────────────────────────────────────────────────────────┐
│                RLS POLICIES                                     │
└────────────────────────────────────────────────────────────────┘

Organisation_Applications Table:

SELECT:
  ✅ Users can view their own applications
  ✅ Org staff can view applications to their org

INSERT:
  ✅ Users can create applications (for themselves)

UPDATE:
  ✅ Users can update their own PENDING applications
  ✅ Org staff can update applications to their org (approve/reject)

DELETE:
  ❌ No delete policy (use status = 'cancelled' instead)
```
