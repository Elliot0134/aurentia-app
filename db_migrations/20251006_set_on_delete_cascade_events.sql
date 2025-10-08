-- Migration: Set ON DELETE CASCADE for events.organizer_id foreign key
-- Date: 2025-10-06
-- Description: Updates the foreign key constraint on the events table to allow cascading deletion of related rows when a profile is deleted.

-- Drop the existing foreign key constraint
ALTER TABLE public.events
DROP CONSTRAINT events_organizer_id_fkey;

-- Add a new foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.events
ADD CONSTRAINT events_organizer_id_fkey
FOREIGN KEY (organizer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;