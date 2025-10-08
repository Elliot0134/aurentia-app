-- Add column to track if organization setup is pending
-- This will be set to true when a user signs up with 'organisation' role without an invitation code

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_setup_pending BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.organization_setup_pending IS 
'Indicates if the user needs to complete organization setup. Set to true when user_role is organisation but has no organization in user_organizations table.';

-- Update existing users who are organisation role but have no organization link in user_organizations
UPDATE public.profiles p
SET organization_setup_pending = true
WHERE p.user_role = 'organisation' 
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_organizations uo 
    WHERE uo.user_id = p.id 
      AND uo.status = 'active'
  );
