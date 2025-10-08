# Quick Fix: Edge Function 401 Error ⚡

## The Problem
```
{"code":401,"message":"Missing authorization header"}
```

## The Fix (3 Simple Steps)

### 1. Create `.supabaserc` in your edge function directory:
```bash
cd supabase/functions/confirm-email
cat > .supabaserc << 'EOF'
{
  "verify_jwt": false,
  "import_map": "import_map.json"
}
EOF
```

### 2. Redeploy the function:
```bash
npx supabase functions deploy confirm-email
```

### 3. Test it:
- Sign up with a new email
- Click the confirmation link
- ✅ Should work now!

## Why This Happens

Supabase Edge Functions **require JWT authentication by default**. 

When users click email links:
- Browser sends GET request with **no auth headers**
- Supabase blocks it → 401 error
- Your code never runs

Solution: Disable JWT verification for public endpoints that validate their own tokens.

## Which Functions Need This?

Any edge function called from:
- Email links ✅ 
- Webhooks ✅
- Public forms ✅
- QR codes ✅

Functions that DON'T need it:
- Authenticated API endpoints ❌
- Admin functions ❌
- User dashboard APIs ❌

## Already Fixed For You ✅

- `/supabase/functions/confirm-email/.supabaserc`
- `/supabase/functions/send-confirmation-email/.supabaserc`
- `/supabase/functions/confirm-email-update/.supabaserc`

All functions have been redeployed and are ready to use!

## See Also

- `EMAIL_VERIFICATION_SOLUTION.md` - Full technical explanation
- `EMAIL_CONFIRMATION_FLOW.md` - Complete flow diagram
