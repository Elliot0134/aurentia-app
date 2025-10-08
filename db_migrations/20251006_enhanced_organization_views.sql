-- Migration: Enhanced organization views with complete data
-- Date: 2025-10-06  
-- Description: Updates views to include all new profile fields

-- Drop and recreate organization adherents view with all fields
DROP VIEW IF EXISTS public.organization_adherents_view CASCADE;
CREATE OR REPLACE VIEW public.organization_adherents_view AS
SELECT 
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.avatar_url,
  p.linkedin_url,
  p.website,
  p.bio,
  p.location,
  p.company,
  p.job_title,
  p.program_type,
  p.cohort_year,
  p.training_budget,
  p.availability_schedule,
  p.monthly_credits_remaining,
  p.purchased_credits_remaining,
  uo.organization_id,
  uo.user_role,
  uo.joined_at,
  uo.status as activity_status,
  -- Project information
  COUNT(DISTINCT proj.id) FILTER (WHERE proj.status = 'active') as active_projects,
  COUNT(DISTINCT proj.id) as total_projects,
  ARRAY_AGG(DISTINCT proj.title) FILTER (WHERE proj.title IS NOT NULL) as project_names,
  -- Deliverables information
  COUNT(DISTINCT d.id) as total_deliverables,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('completed', 'approved')) as completed_deliverables,
  ROUND(
    COALESCE(
      COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('completed', 'approved'))::numeric / 
      NULLIF(COUNT(DISTINCT d.id), 0) * 100, 
      0
    ), 
    0
  ) as completion_rate,
  -- Mentor information
  ARRAY_AGG(DISTINCT (mp.first_name || ' ' || mp.last_name)) FILTER (WHERE ma.mentor_id IS NOT NULL) as mentor_names,
  -- Subscription information
  COALESCE(ms.payment_status, 'no_subscription') as payment_status,
  COALESCE(ms.days_overdue, 0) as subscription_days_overdue,
  ms.last_payment_date,
  ms.next_payment_date,
  ms.amount as subscription_amount
FROM public.profiles p
INNER JOIN public.user_organizations uo ON p.id = uo.user_id
LEFT JOIN public.projects proj ON p.id = proj.creator_id AND proj.organization_id = uo.organization_id
LEFT JOIN public.deliverables d ON p.id = d.entrepreneur_id AND d.organization_id = uo.organization_id
LEFT JOIN public.mentor_assignments ma ON p.id = ma.entrepreneur_id AND ma.organization_id = uo.organization_id AND ma.status = 'active'
LEFT JOIN public.profiles mp ON ma.mentor_id = mp.id
LEFT JOIN public.member_subscriptions ms ON p.id = ms.user_id AND ms.organization_id = uo.organization_id AND ms.status = 'active'
WHERE uo.user_role IN ('individual', 'member', 'entrepreneur')
  AND uo.status = 'active'
GROUP BY 
  p.id, p.email, p.first_name, p.last_name, p.phone, p.avatar_url, 
  p.linkedin_url, p.website, p.bio, p.location, p.company, p.job_title,
  p.program_type, p.cohort_year, p.training_budget, p.availability_schedule,
  p.monthly_credits_remaining, p.purchased_credits_remaining,
  uo.organization_id, uo.user_role, uo.joined_at, uo.status,
  ms.payment_status, ms.days_overdue, ms.last_payment_date, 
  ms.next_payment_date, ms.amount;

-- Drop existing function if signature is different
DROP FUNCTION IF EXISTS public.get_organization_adherents(uuid);

-- Function to get organization adherents with all data
CREATE OR REPLACE FUNCTION public.get_organization_adherents(org_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  linkedin_url text,
  website text,
  bio text,
  location text,
  company text,
  job_title text,
  program_type text,
  cohort_year integer,
  training_budget numeric,
  availability_schedule jsonb,
  monthly_credits_remaining integer,
  purchased_credits_remaining integer,
  organization_id uuid,
  user_role text,
  joined_at timestamp with time zone,
  activity_status text,
  active_projects bigint,
  total_projects bigint,
  project_names text[],
  total_deliverables bigint,
  completed_deliverables bigint,
  completion_rate numeric,
  mentor_names text[],
  payment_status text,
  subscription_days_overdue integer,
  last_payment_date date,
  next_payment_date date,
  subscription_amount numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.organization_adherents_view
  WHERE organization_id = org_id
  ORDER BY joined_at DESC;
$$;

-- Drop and recreate organization mentors view with all fields
DROP VIEW IF EXISTS public.organization_mentors_view CASCADE;
CREATE OR REPLACE VIEW public.organization_mentors_view AS
SELECT 
  m.id,
  m.user_id,
  m.organization_id,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.avatar_url,
  p.linkedin_url as profile_linkedin_url,
  p.website,
  p.bio as profile_bio,
  p.location,
  p.company,
  p.job_title,
  p.user_role,
  m.expertise,
  m.bio as mentor_bio,
  m.linkedin_url as mentor_linkedin_url,
  m.availability,
  m.max_projects,
  m.max_entrepreneurs,
  m.status,
  m.total_entrepreneurs,
  m.success_rate,
  m.rating,
  m.created_at,
  m.updated_at,
  uo.joined_at,
  -- Assignment statistics
  COUNT(DISTINCT ma.id) as total_assignments,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.status = 'active') as active_assignments,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.status = 'completed') as completed_assignments,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.assigned_at >= CURRENT_DATE - INTERVAL '30 days') as recent_assignments,
  COUNT(DISTINCT ma.entrepreneur_id) FILTER (WHERE ma.status = 'active') as current_entrepreneurs
FROM public.mentors m
INNER JOIN public.profiles p ON m.user_id = p.id
INNER JOIN public.user_organizations uo ON m.user_id = uo.user_id AND m.organization_id = uo.organization_id
LEFT JOIN public.mentor_assignments ma ON m.id = ma.mentor_id
WHERE uo.status = 'active'
GROUP BY 
  m.id, m.user_id, m.organization_id, p.email, p.first_name, p.last_name, 
  p.phone, p.avatar_url, p.linkedin_url, p.website, p.bio, p.location,
  p.company, p.job_title, p.user_role, m.expertise, m.bio, m.linkedin_url,
  m.availability, m.max_projects, m.max_entrepreneurs, m.status, 
  m.total_entrepreneurs, m.success_rate, m.rating, m.created_at, 
  m.updated_at, uo.joined_at;

-- Drop existing function if signature is different
DROP FUNCTION IF EXISTS public.get_organization_mentors(uuid);

-- Function to get organization mentors with all data
CREATE OR REPLACE FUNCTION public.get_organization_mentors(org_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  organization_id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  profile_linkedin_url text,
  website text,
  profile_bio text,
  location text,
  company text,
  job_title text,
  user_role text,
  expertise text[],
  mentor_bio text,
  mentor_linkedin_url text,
  availability jsonb,
  max_projects integer,
  max_entrepreneurs integer,
  status text,
  total_entrepreneurs integer,
  success_rate numeric,
  rating numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  joined_at timestamp with time zone,
  total_assignments bigint,
  active_assignments bigint,
  completed_assignments bigint,
  recent_assignments bigint,
  current_entrepreneurs bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.organization_mentors_view
  WHERE organization_id = org_id
  ORDER BY joined_at DESC;
$$;

-- Add comments
COMMENT ON VIEW public.organization_adherents_view IS 'Complete view of organization adherents with all profile and activity data';
COMMENT ON VIEW public.organization_mentors_view IS 'Complete view of organization mentors with all profile and statistics';
COMMENT ON FUNCTION public.get_organization_adherents IS 'Gets all adherents for an organization with complete data';
COMMENT ON FUNCTION public.get_organization_mentors IS 'Gets all mentors for an organization with complete data';
