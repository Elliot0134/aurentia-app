-- Add current_week_override field to action_plan.user_responses table for action plan recalibration
-- This allows users to manually adjust their current week if they are ahead or behind schedule

ALTER TABLE action_plan.user_responses
ADD COLUMN IF NOT EXISTS current_week_override integer;

COMMENT ON COLUMN action_plan.user_responses.current_week_override IS
'Manual override for current week in action plan. If NULL, week is calculated from created_at.
If set, this value is used instead of the calculated week.';
