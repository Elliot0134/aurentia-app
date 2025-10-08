-- Force Supabase PostgREST to reload the schema cache
-- Run this in Supabase SQL Editor

NOTIFY pgrst, 'reload schema';
