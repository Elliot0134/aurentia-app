# Quick Fix Guide - User Metadata Sync Error

## ❌ Error You're Seeing
```
ERROR: 42501: must be owner of relation users
```

## ✅ Why It Happens
You can't create triggers on Supabase's `auth.users` table because it's system-managed.

## 🔧 Fixed Version
The migration has been updated to use an **RPC function** instead of a trigger.

---

## 🚀 Quick Deploy (2 Steps)

### Step 1: Run This SQL in Supabase

Go to **Supabase Dashboard → SQL Editor**, paste and run:

```sql
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone,
    user_role, email_confirmation_required, created_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id)),
    COALESCE(p_first_name, ''),
    COALESCE(p_last_name, ''),
    COALESCE(p_phone, ''),
    'individual', true, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    first_name = CASE WHEN EXCLUDED.first_name IS NOT NULL AND EXCLUDED.first_name != '' 
                 THEN EXCLUDED.first_name ELSE public.profiles.first_name END,
    last_name = CASE WHEN EXCLUDED.last_name IS NOT NULL AND EXCLUDED.last_name != '' 
                THEN EXCLUDED.last_name ELSE public.profiles.last_name END,
    phone = CASE WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' 
            THEN EXCLUDED.phone ELSE public.profiles.phone END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users
UPDATE public.profiles p
SET 
  first_name = COALESCE(p.first_name, au.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(p.last_name, au.raw_user_meta_data->>'last_name'),
  phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone_number', au.raw_user_meta_data->>'phone')
FROM auth.users au
WHERE p.id = au.id
  AND (p.first_name IS NULL OR p.last_name IS NULL OR p.phone IS NULL);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO service_role;
```

### Step 2: Deploy Your Code

The frontend code is already updated in `Signup.tsx`. Just deploy as normal:

```bash
npm run build
# Then deploy to your hosting
```

---

## ✅ Verification

After deployment, test:

1. **Create a new account** with first name, last name, and phone
2. **Check the database**:
   ```sql
   SELECT email, first_name, last_name, phone 
   FROM profiles 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
3. **You should see** all fields populated ✅

---

## 📚 Full Documentation

- `USER_METADATA_FIX_FINAL.md` - Complete guide
- `db_migrations/20251006_fix_user_metadata_sync.sql` - Updated migration
- `src/pages/Signup.tsx` - Updated signup code

---

**That's it!** The fix is now Supabase-compatible and will work without permission errors.
