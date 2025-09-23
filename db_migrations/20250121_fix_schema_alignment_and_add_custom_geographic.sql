-- Migration to fix schema alignment issues and add custom geographic field
-- Created: 2025-01-21
-- Description: 
-- 1. Add owner_id column to organizations table (alias for created_by for backward compatibility)
-- 2. Add id column to project_summary table (alias for project_id for backward compatibility)  
-- 3. Add custom_geographic column to organizations table for custom geographic regions
-- 4. Add custom_type column to organizations table for custom organization types

-- Start transaction
BEGIN;

-- 1. Add owner_id column to organizations table as alias for created_by
-- This allows the application to use both owner_id and created_by interchangeably
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Create a trigger to keep owner_id in sync with created_by
CREATE OR REPLACE FUNCTION sync_organization_owner_id()
RETURNS TRIGGER AS $$
BEGIN
    -- When created_by is updated, update owner_id
    IF TG_OP = 'UPDATE' AND OLD.created_by IS DISTINCT FROM NEW.created_by THEN
        NEW.owner_id = NEW.created_by;
    END IF;
    
    -- When inserting, set owner_id to created_by
    IF TG_OP = 'INSERT' THEN
        NEW.owner_id = NEW.created_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync owner_id with created_by
DROP TRIGGER IF EXISTS sync_organization_owner_id_trigger ON public.organizations;
CREATE TRIGGER sync_organization_owner_id_trigger
    BEFORE INSERT OR UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION sync_organization_owner_id();

-- Update existing records to set owner_id = created_by
UPDATE public.organizations 
SET owner_id = created_by 
WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- 2. Add id column to project_summary table as alias for project_id
-- This allows the application to use both id and project_id interchangeably
ALTER TABLE public.project_summary 
ADD COLUMN IF NOT EXISTS id uuid;

-- Create a trigger to keep id in sync with project_id
CREATE OR REPLACE FUNCTION sync_project_summary_id()
RETURNS TRIGGER AS $$
BEGIN
    -- When project_id is updated, update id
    IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        NEW.id = NEW.project_id;
    END IF;
    
    -- When inserting, set id to project_id
    IF TG_OP = 'INSERT' THEN
        NEW.id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync id with project_id
DROP TRIGGER IF EXISTS sync_project_summary_id_trigger ON public.project_summary;
CREATE TRIGGER sync_project_summary_id_trigger
    BEFORE INSERT OR UPDATE ON public.project_summary
    FOR EACH ROW
    EXECUTE FUNCTION sync_project_summary_id();

-- Update existing records to set id = project_id
UPDATE public.project_summary 
SET id = project_id 
WHERE id IS NULL;

-- 3. Add custom_geographic column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_geographic text;

-- 4. Add custom_type column to organizations table  
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_type text;

-- 5. Update the type constraint to include the new organization types from the form
-- First drop the existing constraint
ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS organizations_type_check;

-- Add the new constraint with updated types (removed chamber_commerce and coworking, kept other for custom)
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_type_check 
CHECK (type = ANY (ARRAY[
    'incubator'::text, 
    'accelerator'::text, 
    'venture_capital'::text, 
    'corporate'::text, 
    'university'::text, 
    'government'::text, 
    'business_school'::text, 
    'consulting'::text, 
    'other'::text
]));

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.owner_id IS 'Alias for created_by column to maintain application compatibility';
COMMENT ON COLUMN public.organizations.custom_geographic IS 'Custom geographic regions when geographic_focus includes custom option';
COMMENT ON COLUMN public.organizations.custom_type IS 'Custom organization type when type is set to other';
COMMENT ON COLUMN public.project_summary.id IS 'Alias for project_id column to maintain application compatibility';

-- Commit transaction
COMMIT;

-- Verify the changes
SELECT 
    'organizations table columns' as table_info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public'
AND column_name IN ('owner_id', 'custom_geographic', 'custom_type', 'created_by')
ORDER BY column_name;

SELECT 
    'project_summary table columns' as table_info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_summary' 
AND table_schema = 'public'
AND column_name IN ('id', 'project_id')
ORDER BY column_name;