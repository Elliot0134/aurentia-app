CREATE TABLE IF NOT EXISTS backup_profiles AS
SELECT id, email, credits_restants, credit_limit, created_at
FROM public.profiles;

CREATE TABLE IF NOT EXISTS backup_project_summary AS
SELECT project_id, user_id, statut_project, created_at, updated_at
FROM public.project_summary;