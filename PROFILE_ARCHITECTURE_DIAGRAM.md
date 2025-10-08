# Profile Fields - Data Flow & Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Profile Page (UI)                       │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   Edit     │  │   Save     │  │  Google Maps        │   │
│  │   Button   │  │   Button   │  │  Autocomplete       │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           EditableFields State                        │   │
│  │  { first_name, last_name, phone, location, company } │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ProfileService Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  updateProfile(userId, updates)                      │   │
│  │    1. Update profiles table                          │   │
│  │    2. Update auth.users.user_metadata               │   │
│  │    3. Return success/failure                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐    ┌──────────────────────┐
│   Supabase Database  │    │   Supabase Auth      │
│   ┌──────────────┐   │    │   ┌──────────────┐   │
│   │   profiles   │   │    │   │ user_metadata│   │
│   │   table      │   │    │   └──────────────┘   │
│   └──────────────┘   │    └──────────────────────┘
└──────────────────────┘
```

## 🔄 Data Flow Diagram

### **1. Initial Page Load**
```
User navigates to /profile
         │
         ▼
┌─────────────────────┐
│  Profile.tsx        │
│  useEffect()        │
│  setIsLoading(true) │
└─────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  profileService           │
│  .getProfile(userId)      │
└───────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  Supabase Query           │
│  FROM profiles            │
│  WHERE id = userId        │
└───────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  Return ProfileData       │
│  {                        │
│    id, email,             │
│    first_name, last_name, │
│    phone, location,       │
│    company, created_at    │
│  }                        │
└───────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  Update UI State          │
│  setUser(profile)         │
│  setEditableFields(...)   │
│  setIsLoading(false)      │
└───────────────────────────┘
         │
         ▼
     Display Profile
```

### **2. Edit and Save Flow**
```
User clicks "Modifier"
         │
         ▼
┌───────────────────────────┐
│  setIsEditing(true)       │
│  Copy data to editable    │
│  fields state             │
└───────────────────────────┘
         │
         ▼
User edits fields (location uses Google Maps)
         │
         ▼
User clicks "Sauvegarder"
         │
         ▼
┌───────────────────────────┐
│  handleSave()             │
│  setIsLoading(true)       │
└───────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  profileService.updateProfile()       │
│                                       │
│  Step 1: Update profiles table        │
│  ┌─────────────────────────────────┐ │
│  │ UPDATE profiles                 │ │
│  │ SET first_name = ?,             │ │
│  │     last_name = ?,              │ │
│  │     phone = ?,                  │ │
│  │     location = ?,               │ │
│  │     company = ?                 │ │
│  │ WHERE id = userId               │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Step 2: Update auth metadata         │
│  ┌─────────────────────────────────┐ │
│  │ supabase.auth.updateUser({      │ │
│  │   data: {                       │ │
│  │     first_name, last_name,      │ │
│  │     phone, location, company    │ │
│  │   }                             │ │
│  │ })                              │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  Update Local State       │
│  setUser({...prev, ...})  │
│  setIsEditing(false)      │
│  setIsLoading(false)      │
└───────────────────────────┘
         │
         ▼
┌───────────────────────────┐
│  Show Success Toast       │
│  "Profil mis à jour"      │
└───────────────────────────┘
```

### **3. Location Autocomplete Flow**
```
User clicks in location field (edit mode)
         │
         ▼
┌────────────────────────────────────┐
│  AddressAutocompleteInput          │
│  monitors input changes            │
└────────────────────────────────────┘
         │
         ▼
User types "Paris"
         │
         ▼
┌────────────────────────────────────┐
│  Google Maps Places API            │
│  autocompleteService               │
│  .getPlacePredictions({            │
│    input: "Paris",                 │
│    types: ['(regions)'],           │
│    componentRestrictions: {        │
│      country: ['fr']               │
│    }                               │
│  })                                │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Receive Suggestions               │
│  [                                 │
│    { description: "Paris, France", │
│      place_id: "..." },            │
│    { description: "Paris, TX, USA",│
│      place_id: "..." },            │
│    ...                             │
│  ]                                 │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Display Custom Dropdown           │
│  - Icon based on type              │
│  - Main text (city/region)         │
│  - Secondary text (country/state)  │
│  - Keyboard navigation enabled     │
└────────────────────────────────────┘
         │
         ▼
User selects suggestion (click or Enter)
         │
         ▼
┌────────────────────────────────────┐
│  Get Place Details                 │
│  placesService.getDetails({        │
│    placeId: selected.place_id,     │
│    fields: ['formatted_address']   │
│  })                                │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Update Field Value                │
│  onChange(formatted_address)       │
│  Close dropdown                    │
└────────────────────────────────────┘
```

## 🗄️ Database Schema

### **profiles Table**
```sql
┌─────────────┬───────────────┬──────────┬─────────┐
│   Column    │     Type      │ Nullable │ Default │
├─────────────┼───────────────┼──────────┼─────────┤
│ id          │ uuid          │ NO       │ -       │ (PK, FK to auth.users)
│ email       │ text          │ YES      │ NULL    │
│ first_name  │ text          │ YES      │ NULL    │ ← NEW
│ last_name   │ text          │ YES      │ NULL    │ ← NEW
│ phone       │ text          │ YES      │ NULL    │ ← ENHANCED
│ location    │ text          │ YES      │ NULL    │ ← ENHANCED (with autocomplete)
│ company     │ text          │ YES      │ NULL    │ ← ENHANCED
│ created_at  │ timestamptz   │ YES      │ now()   │
│ ...         │ ...           │ ...      │ ...     │ (other fields)
└─────────────┴───────────────┴──────────┴─────────┘

Indexes:
  - PRIMARY KEY (id)
  - idx_profiles_location (location) ← NEW for faster queries
```

### **auth.users.raw_user_meta_data**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+33 6 12 34 56 78",
  "location": "Paris, France",
  "company": "Aurentia"
}
```

## 🔐 Security & RLS

### **Row Level Security Policies**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 📦 Component Structure

```
src/
├── pages/
│   └── Profile.tsx ─────────────────┐
│       - Main profile page           │
│       - Handles UI and state        │
│       - Uses profileService         │
│                                     │
├── services/                         │
│   └── profileService.ts ────────────┤
│       - Business logic              │
│       - Database operations         │
│       - Auth metadata sync          │
│                                     │
├── components/ui/                    │
│   └── address-autocomplete-input.tsx┤
│       - Google Maps integration     │
│       - Custom dropdown UI          │
│       - Keyboard navigation         │
│                                     │
└── contexts/                         │
    └── ProjectContext.tsx ───────────┘
        - Provides currentProjectId
        - Used in Facturation tab
```

## 🎨 State Management

### **Profile.tsx State**
```typescript
// User profile data from database
const [user, setUser] = useState<ProfileData>({
  id: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  location: "",
  company: "",
  created_at: ""
});

// Auth user for email confirmation
const [authUser, setAuthUser] = useState<User | null>(null);

// Edit mode flag
const [isEditing, setIsEditing] = useState(false);

// Editable field values (separate from displayed user data)
const [editableFields, setEditableFields] = useState({
  first_name: "",
  last_name: "",
  phone: "",
  location: "",
  company: ""
});

// Loading states
const [isLoading, setIsLoading] = useState(true);
const [emailLoading, setEmailLoading] = useState(false);

// Active tab
const [activeTab, setActiveTab] = useState("Informations");
```

## 🚦 Loading State Flow

```
Page Mount
    │
    ▼
isLoading = true ──────────────┐
    │                          │
    ▼                          │
Fetch profile data             │
    │                          │
    ▼                          │
Success/Error                  │
    │                          │
    ▼                          │
isLoading = false ◄────────────┘
    │
    ▼
Display Content

Special Case: Facturation Tab
    │
    ▼
Check: isLoading || userProjectsLoading
    │
    ├─ true ──→ Show "Chargement..."
    │
    └─ false ─→ Show Subscription Manager or "No Project"
```

## 🔄 Sync Strategy

### **Dual Update Approach**
1. **Primary**: Update `profiles` table (source of truth)
2. **Secondary**: Update `auth.users.user_metadata` (for consistency)

**Why both?**
- ✅ Profiles table: Better queryability, indexing, RLS
- ✅ Auth metadata: Accessible from auth session without DB query
- ✅ Keeps both in sync for reliability

## 📊 Data Consistency

```
┌──────────────────────────────────────────────────────┐
│  WRITE Operation (Update Profile)                    │
│                                                       │
│  1. Update profiles table                            │
│     ┌─────────────────────────────────────────────┐ │
│     │ UPDATE profiles SET first_name = 'John'     │ │
│     └─────────────────────────────────────────────┘ │
│                                                       │
│  2. Update auth metadata                             │
│     ┌─────────────────────────────────────────────┐ │
│     │ UPDATE auth.users                           │ │
│     │ SET raw_user_meta_data = jsonb_set(...)     │ │
│     └─────────────────────────────────────────────┘ │
│                                                       │
│  3. Update local state                               │
│     ┌─────────────────────────────────────────────┐ │
│     │ setUser({ ...prev, first_name: 'John' })    │ │
│     └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  READ Operation (Load Profile)                        │
│                                                       │
│  1. Fetch from profiles table (primary source)       │
│     ┌─────────────────────────────────────────────┐ │
│     │ SELECT * FROM profiles WHERE id = userId    │ │
│     └─────────────────────────────────────────────┘ │
│                                                       │
│  2. Fallback to auth metadata if needed              │
│     ┌─────────────────────────────────────────────┐ │
│     │ session.user.user_metadata                   │ │
│     └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 🎯 Key Features Summary

| Feature | Implementation | Status |
|---------|---------------|--------|
| First Name | Input field, editable | ✅ |
| Last Name | Input field, editable | ✅ |
| Phone | Input field, editable | ✅ |
| Location | Google Maps autocomplete | ✅ |
| Company | Input field, editable | ✅ |
| Loading State | Shows during fetch/save | ✅ |
| Error Handling | Toast notifications | ✅ |
| Data Persistence | Dual update strategy | ✅ |
| RLS Security | User can only edit own profile | ✅ |

---

**Architecture Status:** ✅ Complete & Clean
