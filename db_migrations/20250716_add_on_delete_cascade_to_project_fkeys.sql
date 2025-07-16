-- Drop existing foreign key constraints
ALTER TABLE public.marche DROP CONSTRAINT IF EXISTS marche_project_id_fkey;
ALTER TABLE public.mini_swot DROP CONSTRAINT IF EXISTS mini_swot_project_id_fkey;
ALTER TABLE public.persona_express_b2b DROP CONSTRAINT IF EXISTS persona_express_b2b_project_id_fkey;
ALTER TABLE public.persona_express_b2c DROP CONSTRAINT IF EXISTS persona_express_b2c_project_id_fkey;
ALTER TABLE public.persona_express_organismes DROP CONSTRAINT IF EXISTS persona_express_organismes_project_id_fkey;
ALTER TABLE public.pitch DROP CONSTRAINT IF EXISTS Pitch_project_id_fkey;
ALTER TABLE public.project_collaborators DROP CONSTRAINT IF EXISTS fk_project_collaborators_project_id;
ALTER TABLE public.project_invitations DROP CONSTRAINT IF EXISTS fk_project_invitations_project_id;
ALTER TABLE public.proposition_valeur DROP CONSTRAINT IF EXISTS proposition_valeur_project_id_fkey1;
ALTER TABLE public.rag DROP CONSTRAINT IF EXISTS rag_project_id_fkey;
ALTER TABLE public.ressources_requises DROP CONSTRAINT IF EXISTS ressources_requises_project_id_fkey1;
ALTER TABLE public.success_story DROP CONSTRAINT IF EXISTS success_story_project_id_fkey;
ALTER TABLE public.conversation DROP CONSTRAINT IF EXISTS conversation_project_id_fkey;


-- Add new foreign key constraints with ON DELETE CASCADE
ALTER TABLE public.marche ADD CONSTRAINT marche_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.mini_swot ADD CONSTRAINT mini_swot_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.persona_express_b2b ADD CONSTRAINT persona_express_b2b_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.persona_express_b2c ADD CONSTRAINT persona_express_b2c_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.persona_express_organismes ADD CONSTRAINT persona_express_organismes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.pitch ADD CONSTRAINT Pitch_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.project_collaborators ADD CONSTRAINT fk_project_collaborators_project_id FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.project_invitations ADD CONSTRAINT fk_project_invitations_project_id FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.proposition_valeur ADD CONSTRAINT proposition_valeur_project_id_fkey1 FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.rag ADD CONSTRAINT rag_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.ressources_requises ADD CONSTRAINT ressources_requises_project_id_fkey1 FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.success_story ADD CONSTRAINT success_story_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
ALTER TABLE public.conversation ADD CONSTRAINT conversation_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE;
