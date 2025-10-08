#!/usr/bin/env node

/**
 * Quick script to disable email rate limiting for testing
 * 
 * Usage:
 *   node disable-rate-limit.js        # Disable rate limiting
 *   node disable-rate-limit.js enable # Enable rate limiting (production)
 */

const { execSync } = require('child_process');

const action = process.argv[2] || 'disable';

if (action === 'disable') {
  console.log('🔓 Disabling email rate limiting for testing...');
  try {
    execSync('npx supabase secrets set DISABLE_EMAIL_RATE_LIMIT=true', { stdio: 'inherit' });
    console.log('✅ Rate limiting disabled!');
    console.log('');
    console.log('⚠️  Remember to re-enable before deploying to production!');
    console.log('   Run: node disable-rate-limit.js enable');
  } catch (error) {
    console.error('❌ Failed to set secret:', error.message);
    console.log('');
    console.log('Alternative: Set manually in Supabase Dashboard');
    console.log('  1. Go to Project Settings > Edge Functions > Secrets');
    console.log('  2. Add: DISABLE_EMAIL_RATE_LIMIT = true');
  }
} else if (action === 'enable') {
  console.log('🔒 Enabling email rate limiting (production mode)...');
  try {
    execSync('npx supabase secrets unset DISABLE_EMAIL_RATE_LIMIT', { stdio: 'inherit' });
    console.log('✅ Rate limiting enabled!');
  } catch (error) {
    console.error('❌ Failed to unset secret:', error.message);
    console.log('');
    console.log('Alternative: Remove manually in Supabase Dashboard');
    console.log('  1. Go to Project Settings > Edge Functions > Secrets');
    console.log('  2. Delete: DISABLE_EMAIL_RATE_LIMIT');
  }
} else {
  console.log('Usage:');
  console.log('  node disable-rate-limit.js        # Disable rate limiting');
  console.log('  node disable-rate-limit.js enable # Enable rate limiting');
}
