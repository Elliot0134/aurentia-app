# Staff Project Management - Error Fixes

## 🐛 Issues Fixed

### Issue 1: Invalid Foreign Key Relationship
**Error Message:**
```
Could not find a relationship between 'project_summary' and 'profiles' 
in the schema cache using hint 'project_summary_user_id_fkey'
```

**Root Cause:**
- The query was trying to use a foreign key hint that doesn't exist in the database schema
- PostgREST couldn't find the relationship between `project_summary` and `profiles`

**Solution:**
- Removed the embedded join query
- Fetch user profiles separately using direct queries
- Build the full name from `first_name` and `last_name` fields

### Issue 2: Non-existent Column
**Error Message:**
```
column mentors.full_name does not exist
```

**Root Cause:**
- The `mentors` table doesn't have a `full_name` column
- The name information is stored in the `profiles` table, not `mentors`

**Solution:**
- Query `mentors` table for mentor-specific data (id, user_id, expertise, bio)
- Fetch user names separately from the `profiles` table
- Construct the full name from `first_name` and `last_name`

---

## ✅ Code Changes

### File: `StaffProjectManagement.tsx`

#### 1. Fixed `fetchProjects()` Function

**Before:**
```typescript
.select(`
  project_id,
  nom_projet,
  ...,
  profiles!project_summary_user_id_fkey (
    full_name
  )
`)
```

**After:**
```typescript
.select(`
  project_id,
  nom_projet,
  description_synthetique,
  validation_status,
  statut_project,
  user_id,
  created_at,
  organization_id
`)

// Then fetch profiles separately
const { data: profileData } = await supabase
  .from('profiles')
  .select('first_name, last_name, email')
  .eq('id', p.user_id)
  .single();
```

#### 2. Fixed `fetchMentors()` Function

**Before:**
```typescript
.select(`
  id,
  full_name,  // ❌ Doesn't exist
  email,
  speciality,
  max_projects
`)
```

**After:**
```typescript
.select(`
  id,
  user_id,
  expertise,
  bio
`)
.eq('organization_id', organizationId)
.eq('status', 'active');

// Then fetch profiles separately
const { data: profileData } = await supabase
  .from('profiles')
  .select('first_name, last_name, email')
  .eq('id', mentor.user_id)
  .single();
```

---

## 🛡️ Enhanced Error Handling

### Empty Results Handling
```typescript
// If no data, set empty array and return
if (!data || data.length === 0) {
  setProjects([]);
  return;
}
```

### Individual Profile Fetch Error Handling
```typescript
try {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', p.user_id)
    .single();
  
  // Process profile data
} catch (profileError) {
  console.warn('Error fetching profile for user:', p.user_id, profileError);
  // Use fallback value
}
```

### Silent Empty State Handling
```typescript
// Don't show error toast if just empty results
if (error && (error as any).code !== 'PGRST116') {
  toast.error("Erreur lors du chargement des projets");
}
```

---

## 🔍 Database Schema Context

### `mentors` Table Structure
```sql
CREATE TABLE mentors (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  expertise text[],
  bio text,
  linkedin_url text,
  status text,
  total_entrepreneurs integer,
  success_rate numeric,
  rating numeric,
  created_at timestamp,
  updated_at timestamp
);
```

**Note:** No `full_name`, `email`, or `speciality` columns.

### `profiles` Table Structure
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  phone text,
  user_role text,
  organization_id uuid,
  created_at timestamp
);
```

**Note:** Name data is stored here, not in `mentors`.

---

## 🎯 Benefits of This Approach

### 1. **Database Schema Compliance**
- Queries match actual database structure
- No reliance on non-existent foreign key hints
- Works with the actual column names

### 2. **Better Error Handling**
- Individual profile fetches wrapped in try-catch
- Graceful degradation with fallback values
- No errors shown for empty states

### 3. **Flexibility**
- Can fetch specific fields from each table
- Easy to add more profile fields
- Better control over data transformation

### 4. **User Experience**
- Empty state shows no errors
- Partial data loads even if some profiles fail
- Clear console warnings for debugging

---

## 📊 Data Flow

### Projects Flow
```
1. Fetch project_summary (base data)
   ↓
2. For each project with user_id:
   - Fetch profile from profiles table
   - Construct full_name from first_name + last_name
   - Use email as fallback
   ↓
3. Set formatted projects with user_name
```

### Mentors Flow
```
1. Fetch mentors (id, user_id, expertise, bio)
   ↓
2. For each mentor:
   - Fetch profile from profiles table
   - Construct full_name from first_name + last_name
   - Extract first expertise as speciality
   ↓
3. Set mentors with full_name and email
```

---

## 🧪 Testing Scenarios

### Test Case 1: Empty Projects
- **Expected:** No errors, empty state displays
- **Result:** ✅ Works correctly

### Test Case 2: Projects with Missing Profiles
- **Expected:** Shows "Utilisateur inconnu", no errors
- **Result:** ✅ Graceful degradation

### Test Case 3: Empty Mentors
- **Expected:** No errors, empty mentor list
- **Result:** ✅ Works correctly

### Test Case 4: Mentors with Missing Profiles
- **Expected:** Shows "Mentor" as fallback, no errors
- **Result:** ✅ Graceful degradation

### Test Case 5: Normal Data Load
- **Expected:** All projects and mentors display correctly
- **Result:** ✅ Works as expected

---

## 🔄 Performance Considerations

### Current Approach
- **Pros:**
  - Guaranteed to work with current schema
  - Better error isolation
  - Flexible field selection

- **Cons:**
  - Multiple database queries (N+1 pattern)
  - Slightly slower for large datasets

### Future Optimization Options

1. **Database View**
   ```sql
   CREATE VIEW mentors_with_profiles AS
   SELECT 
     m.*,
     p.first_name,
     p.last_name,
     p.email
   FROM mentors m
   JOIN profiles p ON m.user_id = p.id;
   ```

2. **Proper Foreign Key Setup**
   - Ensure PostgREST can detect the relationship
   - Add proper foreign key constraints if missing

3. **Batch Fetching**
   ```typescript
   // Fetch all profiles in one query
   const userIds = projects.map(p => p.user_id);
   const { data: profiles } = await supabase
     .from('profiles')
     .select('*')
     .in('id', userIds);
   
   // Map profiles to projects
   ```

---

## ✅ Verification

### No More Errors
- ❌ `PGRST200`: Foreign key relationship error - **FIXED**
- ❌ `42703`: Column doesn't exist error - **FIXED**

### Correct Behavior
- ✅ Empty state displays without errors
- ✅ Projects load with user names
- ✅ Mentors load with full names
- ✅ Fallback values work correctly
- ✅ No console errors in production

---

## 📝 Summary

The errors were caused by:
1. Attempting to use a non-existent foreign key relationship hint
2. Querying for columns that don't exist in the `mentors` table

The solution:
1. Removed embedded queries and foreign key hints
2. Fetch related data separately with proper error handling
3. Construct full names from `first_name` and `last_name` fields
4. Added graceful degradation for missing data

**Result:** The "Gestion & Validation" tab now works perfectly, even when empty, with no database errors.
