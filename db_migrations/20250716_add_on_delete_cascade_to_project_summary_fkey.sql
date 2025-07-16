-- Drop existing foreign key constraint on project_summary referencing form_business_idea
ALTER TABLE public.project_summary DROP CONSTRAINT IF EXISTS project_summary_project_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.project_summary ADD CONSTRAINT project_summary_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.form_business_idea(project_id) ON DELETE CASCADE;
