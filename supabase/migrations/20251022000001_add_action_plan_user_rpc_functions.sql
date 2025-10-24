-- Create RPC functions to fetch action plan data by user_id for activity tracking

-- Get all user_responses for a user (across all projects)
CREATE OR REPLACE FUNCTION public.get_action_plan_user_responses_by_user(user_uuid uuid)
RETURNS SETOF action_plan.user_responses
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM action_plan.user_responses WHERE user_id = user_uuid ORDER BY created_at DESC;
$$;

-- Get all taches for a user (across all projects)
CREATE OR REPLACE FUNCTION public.get_action_plan_taches_by_user(user_uuid uuid)
RETURNS SETOF action_plan.taches
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM action_plan.taches WHERE user_id = user_uuid ORDER BY updated_at DESC;
$$;

-- Get all jalons for a user (across all projects)
CREATE OR REPLACE FUNCTION public.get_action_plan_jalons_by_user(user_uuid uuid)
RETURNS SETOF action_plan.jalons
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM action_plan.jalons WHERE user_id = user_uuid ORDER BY updated_at DESC;
$$;
