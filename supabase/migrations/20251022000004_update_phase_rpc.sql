-- Update RPC function to set current phase instead of week

DROP FUNCTION IF EXISTS public.update_action_plan_week_override(uuid, integer);

CREATE OR REPLACE FUNCTION public.update_action_plan_current_phase(
  project_uuid uuid,
  phase_id_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE action_plan.user_responses
  SET current_phase_id = phase_id_value
  WHERE project_id = project_uuid;
END;
$$;
