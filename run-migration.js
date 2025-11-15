import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the migration file
const migrationSQL = readFileSync('./supabase/migrations/20251115000000_create_beta_table.sql', 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runMigration() {
  console.log('Starting migration...');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
    console.log(statement.substring(0, 100) + '...');

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try alternative method using REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        });

        if (!response.ok) {
          console.error('Error executing statement:', error || response.statusText);
          // Continue anyway as some errors might be expected (like table already exists)
        } else {
          console.log('✓ Statement executed successfully');
        }
      } else {
        console.log('✓ Statement executed successfully');
      }
    } catch (err) {
      console.error('Error:', err.message);
      // Continue anyway
    }
  }

  console.log('\nMigration completed!');

  // Verify the table was created
  const { data, error } = await supabase
    .from('beta')
    .select('*')
    .limit(1);

  if (error) {
    console.error('\nVerification failed:', error.message);
  } else {
    console.log('\n✓ Table "beta" verified successfully!');
  }
}

runMigration().catch(console.error);
