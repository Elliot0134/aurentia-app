-- Migration pour corriger la table events et ses policies RLS
-- Date: 2025-01-24

-- S'assurer que la table events existe avec la structure correcte
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  type text NOT NULL DEFAULT 'other' CHECK (type = ANY (ARRAY['workshop'::text, 'meeting'::text, 'webinar'::text, 'networking'::text, 'presentation'::text, 'training'::text, 'other'::text])),
  location text,
  organizer_id uuid,
  is_recurring boolean DEFAULT false,
  max_participants integer CHECK (max_participants >= 0),
  participants text[] DEFAULT '{}',
  status text DEFAULT 'planned'::text CHECK (status = ANY (ARRAY['planned'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT events_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Activer RLS sur la table events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Organization members can view events" ON public.events;
DROP POLICY IF EXISTS "Organization admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view organization events" ON public.events;
DROP POLICY IF EXISTS "Users can manage organization events" ON public.events;

-- Créer les nouvelles policies RLS
CREATE POLICY "Users can view organization events" ON public.events
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id IS NOT NULL
  )
);

CREATE POLICY "Users can manage organization events" ON public.events
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_role IN ('organisation', 'staff')
    AND organization_id IS NOT NULL
  )
);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON public.events;
CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at();

-- Commenter la table et les colonnes importantes
COMMENT ON TABLE public.events IS 'Table des événements d''organisation';
COMMENT ON COLUMN public.events.max_participants IS 'Nombre maximum de participants (doit être >= 0)';
COMMENT ON COLUMN public.events.participants IS 'Liste des IDs des participants';
COMMENT ON COLUMN public.events.type IS 'Type d''événement: workshop, meeting, webinar, networking, presentation, training, other';
COMMENT ON COLUMN public.events.status IS 'Statut de l''événement: planned, ongoing, completed, cancelled';