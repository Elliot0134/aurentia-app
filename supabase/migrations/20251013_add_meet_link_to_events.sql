-- Add meet_link column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS meet_link text;

-- Add comment to explain the column
COMMENT ON COLUMN public.events.meet_link IS 'URL for online meeting (Zoom, Google Meet, etc.)';
