-- Create RPC function to update the current_week_override field

CREATE OR REPLACE FUNCTION public.update_action_plan_week_override(
  project_uuid uuid,
  new_week integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE action_plan.user_responses
  SET current_week_override = new_week
  WHERE project_id = project_uuid;
END;
$$;
