# Session Refresh Policy

## Question
**"Will my session refresh EVERY time I get an error in the console? Or only for Supabase-related errors?"**

## Answer: Only for Token-Specific Errors ✅

Your session will **NOT** refresh on random console errors. Session refresh is **highly selective** and only happens for **authentication token issues**.

## When Session Refresh Happens

### ✅ Token/JWT Errors Only
Session refresh is triggered **ONLY** when the error message contains:
- `"jwt"` (case-insensitive)
- `"token"` (case-insensitive)  
- `"expired"` (case-insensitive)
- `"refresh"` (case-insensitive)

### ❌ Session Refresh Does NOT Happen For:
- Random console errors
- Application logic errors
- Network errors (connection refused, timeout, etc.)
- RLS (Row Level Security) policy failures
- Validation errors
- 404/500 HTTP errors
- React errors
- Any non-authentication errors

## Implementation Details

### 1. Profile Fetch Retry (Lines 78-96)
```typescript
// Retry logic when fetching user profile
if (attempt === 1 && (error.message?.includes('JWT') || error.message?.includes('token'))) {
  console.log('[useUserProfile] Token error, attempting refresh...');
  await supabase.auth.refreshSession();
}
```

**Trigger**: Profile fetch fails with JWT/token error  
**Frequency**: Once per profile load, only on token errors  
**Impact**: Minimal - happens during initial load or data fetch  

### 2. Periodic Session Check (Every 2 Minutes)
```typescript
const isTokenError = error.message?.toLowerCase().includes('jwt') || 
                    error.message?.toLowerCase().includes('token') ||
                    error.message?.toLowerCase().includes('expired') ||
                    error.message?.toLowerCase().includes('refresh');

if (isTokenError) {
  console.log('[useUserProfile] Token-related error detected, attempting refresh...');
  await supabase.auth.refreshSession();
} else {
  console.log('[useUserProfile] Non-token error during session check, ignoring:', error.message);
}
```

**Trigger**: Periodic check finds token-related error  
**Frequency**: Maximum once per 2 minutes, only on token errors  
**Impact**: Low - prevents stale sessions  

### 3. Visibility Change Check (Tab Focus)
```typescript
const isTokenError = error?.message?.toLowerCase().includes('jwt') || 
                    error?.message?.toLowerCase().includes('token') ||
                    error?.message?.toLowerCase().includes('expired') ||
                    error?.message?.toLowerCase().includes('refresh');

if (isTokenError || (!error && !session)) {
  console.log('[useUserProfile] Session invalid on visibility change, attempting refresh...');
  await supabase.auth.refreshSession();
} else if (error) {
  console.log('[useUserProfile] Non-token error on visibility change, ignoring:', error.message);
}
```

**Trigger**: Tab becomes visible AND (token error OR no session)  
**Frequency**: Once per tab focus, only on token errors or missing session  
**Impact**: Low - recovers sessions after long idle periods  

## Supabase Auto-Refresh

Additionally, Supabase has **built-in automatic token refresh**:

```typescript
// In your Supabase client configuration
createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,  // ← Automatic refresh before expiration
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

This means **Supabase automatically refreshes tokens** before they expire (default: 60 minutes), so manual refresh is only needed for:
- Recovery from errors
- Expired tokens after long idle
- Browser session restoration

## Example Scenarios

### ✅ Session WILL Refresh:
```typescript
// Error: "JWT expired" 
// ✓ Contains "JWT" → Refresh triggered

// Error: "Invalid token signature"
// ✓ Contains "token" → Refresh triggered

// Error: "Session has expired"
// ✓ Contains "expired" → Refresh triggered
```

### ❌ Session WILL NOT Refresh:
```typescript
// Error: "Network request failed"
// ✗ Not a token error → Ignored

// Error: "Row level security policy violation"
// ✗ Not a token error → Ignored

// Error: "TypeError: Cannot read property 'id' of null"
// ✗ Not a token error → Ignored

// Error: "Failed to fetch"
// ✗ Not a token error → Ignored
```

## Benefits of This Policy

1. **Stability**: Won't refresh on temporary network issues
2. **Performance**: Reduces unnecessary authentication calls
3. **User Experience**: No interruptions during normal usage
4. **Resilience**: Automatically recovers from genuine token issues
5. **Debugging**: Clear console logs show when and why refresh happens

## Monitoring Session Refresh

Look for these console messages to see when refresh happens:

```bash
# Token error detected
[useUserProfile] Token error, attempting refresh...

# Periodic check finds token issue
[useUserProfile] Token-related error detected, attempting refresh...

# Tab focus recovery
[useUserProfile] Session invalid on visibility change, attempting refresh...

# Non-token errors are ignored
[useUserProfile] Non-token error during session check, ignoring: <error>
```

## Summary

**Your session is safe!** It will only refresh when there's a **genuine authentication problem**, not on random console errors. The app will work normally even with other errors in the console.
