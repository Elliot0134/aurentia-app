# 📊 Database Views Explained

## 🤔 What Are Database Views?

### Simple Explanation
A **database view** is like a **saved query with a name**. It's a virtual table that doesn't store data itself but shows you the result of a complex query.

Think of it like a **YouTube playlist**:
- The videos (data) are stored elsewhere
- The playlist (view) just shows you a specific collection
- The playlist updates automatically when videos are added/removed

### Technical Definition
A view is a stored SELECT query that combines data from multiple tables and presents it as if it were a single table.

---

## 🎯 Why Views Are Useful

### 1. **Simplification** 
Instead of writing this every time:
```sql
SELECT p.id, p.email, p.first_name, COUNT(proj.id) as projects,
       ARRAY_AGG(mentor.name) as mentors, ms.payment_status
FROM profiles p
JOIN user_organizations uo ON p.id = uo.user_id
LEFT JOIN projects proj ON p.id = proj.creator_id
LEFT JOIN mentor_assignments ma ON p.id = ma.entrepreneur_id
LEFT JOIN profiles mentor ON ma.mentor_id = mentor.id
LEFT JOIN member_subscriptions ms ON p.id = ms.user_id
WHERE uo.organization_id = 'xxx'
GROUP BY p.id, p.email, p.first_name, ms.payment_status;
```

You just write:
```sql
SELECT * FROM organization_adherents_view WHERE organization_id = 'xxx';
```

### 2. **Data Aggregation**
Views automatically combine data from multiple tables:
- `profiles` - User info
- `user_organizations` - Organization membership
- `projects` - User projects
- `deliverables` - Completed work
- `mentor_assignments` - Assigned mentors
- `member_subscriptions` - Payment status

### 3. **Consistency**
The same logic is used everywhere in your app. If you change the view, all queries benefit.

### 4. **Performance** (in some cases)
Database can optimize the query once instead of every time you run it.

### 5. **Security**
Views can hide sensitive columns or restrict data access.

---

## 📋 Views in Your App

### **1. `organization_adherents_view`**

**What it does:**
Combines all data about organization members (adherents/entrepreneurs) in one place.

**Data included:**
- ✅ Personal info (name, email, phone)
- ✅ Profile fields (avatar, LinkedIn, website, bio, location, company, job title)
- ✅ Program info (program type, cohort, training budget)
- ✅ Activity data (active projects, total projects, completion rate)
- ✅ Credits (monthly remaining, purchased remaining)
- ✅ Mentor assignments (names of assigned mentors)
- ✅ Subscription info (payment status, days overdue, amounts, dates)

**Used in:**
```typescript
// src/services/organisationService.ts
const { data, error } = await supabase
  .rpc('get_organization_adherents', { org_id: organizationId });
```

**Why it exists:**
Without this view, you'd need to:
1. Query `profiles` table
2. Join with `user_organizations`
3. Count projects
4. Count deliverables
5. Calculate completion rates
6. Aggregate mentor names
7. Join subscription data
8. Do this every single time you load the adherents page

**With the view:** One simple query gets everything!

---

### **2. `organization_mentors_view`**

**What it does:**
Combines all data about organization mentors in one place.

**Data included:**
- ✅ Personal info (name, email, phone)
- ✅ Profile fields (avatar, LinkedIn, website, bio, location, company, job title)
- ✅ Mentor-specific (expertise, mentor bio, availability)
- ✅ Capacity (max projects, max entrepreneurs)
- ✅ Statistics (total assignments, active assignments, completed assignments)
- ✅ Recent activity (assignments in last 30 days)
- ✅ Current load (how many entrepreneurs currently assigned)

**Used in:**
```typescript
// src/services/organisationService.ts
const { data, error } = await supabase
  .rpc('get_organization_mentors', { org_id: organizationId });

// Also used directly:
const { data } = await supabase
  .from('organization_mentors_view')
  .select('*')
  .eq('organization_id', orgId);
```

**Why it exists:**
Without this view, you'd need to:
1. Query `mentors` table
2. Join with `profiles` for user info
3. Join with `user_organizations` for org membership
4. Count all assignments
5. Filter assignments by status
6. Calculate statistics (active, completed, recent)
7. Do complex GROUP BY and aggregations

**With the view:** Everything in one query!

---

## 🔧 How Views Work in Your App Flow

### **Loading Adherents Page:**
```
User clicks "Adherents" tab
  ↓
OrganisationAdherents.tsx component loads
  ↓
useOrganisationData hook calls fetchAdherents()
  ↓
organisationService.fetchAdherents() is called
  ↓
Supabase executes: get_organization_adherents(org_id)
  ↓
Database queries organization_adherents_view
  ↓
View automatically:
  - Joins profiles + user_organizations + projects + deliverables
  - Aggregates mentor assignments
  - Pulls subscription data
  - Calculates totals and percentages
  ↓
Returns complete data array
  ↓
Component displays all fields in table
```

### **Loading Mentors Page:**
```
User clicks "Mentors" tab
  ↓
OrganisationMentors.tsx component loads
  ↓
useOrganisationData hook calls fetchMentors()
  ↓
organisationService.fetchMentors() is called
  ↓
Supabase executes: get_organization_mentors(org_id)
  ↓
Database queries organization_mentors_view
  ↓
View automatically:
  - Joins mentors + profiles + user_organizations
  - Counts all assignments (total, active, completed)
  - Calculates recent assignments (last 30 days)
  - Gets current entrepreneur count
  ↓
Returns complete mentor data array
  ↓
Component displays all mentor info and statistics
```

---

## 🛠️ View Functions

Your app also uses **view functions** which are wrappers around the views:

### **`get_organization_adherents(org_id)`**
```sql
CREATE OR REPLACE FUNCTION public.get_organization_adherents(org_id uuid)
RETURNS TABLE (...)
AS $$
  SELECT * FROM public.organization_adherents_view
  WHERE organization_id = org_id
  ORDER BY joined_at DESC;
$$;
```

**Why use a function instead of querying the view directly?**
1. **Security** - Function has `SECURITY DEFINER` so it runs with proper permissions
2. **Abstraction** - Can change the underlying implementation without changing app code
3. **Default ordering** - Always returns results sorted by `joined_at DESC`
4. **Performance** - Can add indexes, caching, or optimizations later

---

## 🐛 Errors Fixed

### **Error 1: Avatar Migration**
```
ERROR: must be owner of table objects
```

**Cause:** Tried to enable RLS on `storage.objects` which is a Supabase system table.

**Fix:** Removed the line - RLS is already enabled by Supabase on all storage tables.

```sql
-- ❌ Before (caused error):
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ✅ After (fixed):
-- Note: RLS on storage.objects is already enabled by Supabase
```

---

### **Error 2: View Column Reference**
```
ERROR: column ma.created_at does not exist
HINT: Perhaps you meant to reference the column "m.created_at".
```

**Cause:** Used `ma.created_at` but the `mentor_assignments` table has `assigned_at` not `created_at`.

**Fix:** Changed to use the correct column name.

```sql
-- ❌ Before (caused error):
COUNT(DISTINCT ma.id) FILTER (WHERE ma.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_assignments

-- ✅ After (fixed):
COUNT(DISTINCT ma.id) FILTER (WHERE ma.assigned_at >= CURRENT_DATE - INTERVAL '30 days') as recent_assignments
```

---

## ✅ Summary

### **Views = Saved Complex Queries**
Instead of writing complex JOINs everywhere, write them once in a view.

### **Your App Uses 2 Main Views:**
1. **`organization_adherents_view`** - All adherent/member data
2. **`organization_mentors_view`** - All mentor data

### **Benefits:**
- ✅ Simpler code
- ✅ Consistent data
- ✅ Easier maintenance
- ✅ Better security
- ✅ Potential performance gains

### **Both Errors Now Fixed:**
- ✅ Avatar migration (removed unnecessary RLS enable)
- ✅ View query (fixed column name from `created_at` to `assigned_at`)

### **Ready to Deploy:**
All 4 migrations are now error-free and ready to run! 🚀
