-- Rollback script for organization RLS policies migration
-- Use this if you need to revert the changes

-- =====================================================
-- 1. DROP ALL POLICIES
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on organizations table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', r.policyname);
        RAISE NOTICE 'Dropped policy: % on organizations', r.policyname;
    END LOOP;
    
    -- Drop all existing policies on user_organizations table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_organizations'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_organizations', r.policyname);
        RAISE NOTICE 'Dropped policy: % on user_organizations', r.policyname;
    END LOOP;
END $$;

-- =====================================================
-- 2. DROP HELPER FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS public.is_organization_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_organization_admin(uuid, uuid);

RAISE NOTICE 'Rollback completed. All policies and helper functions have been removed.';
RAISE NOTICE 'WARNING: Tables no longer have RLS policies. You should apply a new migration or restore from backup.';
