import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Creating beta table...\n');

// SQL to create the table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.beta (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT beta_pkey PRIMARY KEY (id),
  CONSTRAINT beta_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_beta_email ON public.beta(email);
CREATE INDEX IF NOT EXISTS idx_beta_created_at ON public.beta(created_at DESC);

ALTER TABLE public.beta ENABLE ROW LEVEL SECURITY;
`;

const createPoliciesSQL = `
DROP POLICY IF EXISTS "Anonymous users can insert beta emails" ON public.beta;
DROP POLICY IF EXISTS "Authenticated users can insert beta emails" ON public.beta;
DROP POLICY IF EXISTS "Super admins can view beta emails" ON public.beta;

CREATE POLICY "Anonymous users can insert beta emails"
  ON public.beta
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert beta emails"
  ON public.beta
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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
`;

const grantPermissionsSQL = `
GRANT INSERT ON public.beta TO anon;
GRANT INSERT ON public.beta TO authenticated;
GRANT SELECT ON public.beta TO authenticated;
`;

async function createBetaTable() {
  try {
    console.log('Testing Supabase connection...');

    // Test if we can query the beta table (will fail if it doesn't exist, which is ok)
    const { data: existingData, error: selectError } = await supabase
      .from('beta')
      .select('id')
      .limit(1);

    if (!selectError) {
      console.log('✓ Table "beta" already exists!');
      console.log('\n📊 Verifying table structure...');

      // Try to insert a test record
      const testEmail = `test-${Date.now()}@example.com`;
      const { error: insertError } = await supabase
        .from('beta')
        .insert([{ email: testEmail }]);

      if (insertError) {
        console.log('⚠️  Insert test failed:', insertError.message);
        console.log('You may need to run the migration manually in Supabase SQL Editor');
      } else {
        console.log('✓ Table is functional! Test insert successful.');

        // Delete test record
        await supabase
          .from('beta')
          .delete()
          .eq('email', testEmail);
      }

      return;
    }

    console.log('⚠️  Table does not exist yet.');
    console.log('\n📝 Please run the migration in Supabase SQL Editor:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the SQL from: supabase/migrations/20251115000000_create_beta_table.sql');
    console.log('4. Execute it\n');

    console.log('Or use the Supabase CLI:');
    console.log('supabase db push --password YOUR_DATABASE_PASSWORD\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBetaTable();
