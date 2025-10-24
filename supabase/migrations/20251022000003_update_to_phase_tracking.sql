-- Update action plan tracking from week-based to phase-based
-- Replace current_week_override with current_phase_id for flexible tracking

-- Remove the old week override field
ALTER TABLE action_plan.user_responses
DROP COLUMN IF EXISTS current_week_override;

-- Add new phase tracking field
ALTER TABLE action_plan.user_responses
ADD COLUMN IF NOT EXISTS current_phase_id text;

COMMENT ON COLUMN action_plan.user_responses.current_phase_id IS
'ID of the phase the user is currently focusing on. If NULL, system infers from recent task activity.
Allows manual control of which phase to display in dashboard timeline.';
