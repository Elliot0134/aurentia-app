-- Create beta table for storing email addresses of users interested in the beta
-- This table allows anonymous users to submit their email to be notified when Aurentia launches

CREATE TABLE IF NOT EXISTS public.beta (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT beta_pkey PRIMARY KEY (id),
  CONSTRAINT beta_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_beta_email ON public.beta(email);
CREATE INDEX IF NOT EXISTS idx_beta_created_at ON public.beta(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.beta ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous users to insert their email
CREATE POLICY "Anonymous users can insert beta emails"
  ON public.beta
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to insert their email
CREATE POLICY "Authenticated users can insert beta emails"
  ON public.beta
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Only super_admins can view beta emails
CREATE POLICY "Super admins can view beta emails"
  ON public.beta
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.user_role = 'super_admin'
    )
  );

-- Grant necessary permissions
GRANT INSERT ON public.beta TO anon;
GRANT INSERT ON public.beta TO authenticated;
GRANT SELECT ON public.beta TO authenticated;

-- Comment on table
COMMENT ON TABLE public.beta IS 'Stores email addresses of users interested in the Aurentia beta program';
COMMENT ON COLUMN public.beta.email IS 'Email address to notify when Aurentia launches';
