# Quick Reference: Profile Fields Integration

## 🚀 Quick Start

### Run the Migration
```sql
-- Execute in Supabase SQL Editor
\i db_migrations/20251007_ensure_profile_fields.sql
```

### Profile Fields Available
| Field | Type | Editable | Autocomplete |
|-------|------|----------|--------------|
| Email | text | ❌ | - |
| First Name | text | ✅ | - |
| Last Name | text | ✅ | - |
| Phone | text | ✅ | - |
| Location | text | ✅ | ✅ Google Maps |
| Company | text | ✅ | - |

## 📖 Usage Examples

### Fetch Profile
```typescript
import { profileService } from '@/services/profileService';

const profile = await profileService.getProfile(userId);
// Returns: { id, email, first_name, last_name, phone, location, company, created_at }
```

### Update Profile
```typescript
const success = await profileService.updateProfile(userId, {
  first_name: "John",
  last_name: "Doe",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  company: "Aurentia"
});
```

### Sync Auth to Profile
```typescript
// Useful after user updates auth metadata elsewhere
await profileService.syncAuthToProfile(userId);
```

## 🐛 Troubleshooting

### Problem: "Loading..." never stops
**Solution:** Check browser console for errors. Profile service fetches from `profiles` table - ensure user has a row there.

### Problem: Location autocomplete not working
**Solution:** Verify `VITE_GOOGLE_MAPS_API_KEY` is set in `.env` file.

### Problem: Changes not saving
**Solution:** Check RLS policies on `profiles` table. User must have UPDATE permission on their own row.

## 🔑 Environment Variables

```env
# .env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDD-eg5dT7TkT9EPjVuaLlJC5NeC9OJduQ
```

## 📊 Database Schema

```sql
-- profiles table (relevant fields)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  first_name text,
  last_name text,
  phone text,
  location text,
  company text,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for location queries
CREATE INDEX idx_profiles_location ON public.profiles(location);
```

## 🎯 Key Features

### ✅ Dual Update Strategy
Updates both `profiles` table AND `auth.users.user_metadata` for consistency.

### ✅ Loading States
- Initial profile load: Shows "Chargement de votre profil..."
- Save operation: Button shows "Sauvegarde..."
- Facturation tab: Checks both profile and projects loading

### ✅ Google Maps Autocomplete
- Type-ahead suggestions
- Keyboard navigation (↑/↓, Enter, Esc)
- Regions-only mode for better UX
- Custom styled dropdown

## 🔍 Code Snippets

### Edit Mode Toggle
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editableFields, setEditableFields] = useState({
  first_name: "",
  last_name: "",
  phone: "",
  location: "",
  company: ""
});
```

### Handle Save
```typescript
const handleSave = async () => {
  const success = await profileService.updateProfile(user.id, editableFields);
  if (success) {
    setUser(prev => ({ ...prev, ...editableFields }));
    setIsEditing(false);
    toast({ title: "Profil mis à jour" });
  }
};
```

### Location Field with Autocomplete
```tsx
<AddressAutocompleteInput
  value={editableFields.location}
  onChange={(value) => handleFieldChange('location', value)}
  placeholder="Entrez votre localisation"
  addressType="regions"
/>
```

## 📱 UI States

| State | User Sees |
|-------|-----------|
| Loading | "Chargement de votre profil..." |
| Viewing | Profile fields with "Modifier" button |
| Editing | Input fields with "Sauvegarder" and "Annuler" buttons |
| Saving | "Sauvegarde..." button text |

## ⚡ Performance Tips

1. **Location Index**: The migration creates an index on `location` for fast queries
2. **Minimal Updates**: Only changed fields are sent to database
3. **Loading States**: Prevent duplicate requests
4. **Error Boundaries**: Graceful degradation if Google Maps fails to load

## 🔐 Security Considerations

- User can only update their own profile (enforced by RLS)
- Input sanitization happens at database level
- Auth metadata sync prevents desync issues
- Loading states prevent race conditions

---

**Need Help?** Check the full implementation guide: `PROFILE_FIELDS_IMPLEMENTATION.md`
