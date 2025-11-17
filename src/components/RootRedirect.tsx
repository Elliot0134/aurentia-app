import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Smart redirect for root route that handles OAuth callbacks
 *
 * If URL contains OAuth code/token (from OAuth redirect), forward to /auth/callback
 * Otherwise, redirect to beta-inscription
 */
const RootRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hash = location.hash;

    // Check if this is an OAuth callback (has code, access_token, or error)
    const hasOAuthCode = searchParams.has('code');
    const hasOAuthToken = hash.includes('access_token') || hash.includes('id_token');
    const hasOAuthError = searchParams.has('error');

    if (hasOAuthCode || hasOAuthToken || hasOAuthError) {
      // This is an OAuth callback - redirect to /auth/callback with all params
      console.log('[RootRedirect] OAuth callback detected, redirecting to /auth/callback');
      navigate(`/auth/callback${location.search}${location.hash}`, { replace: true });
    } else {
      // Normal root access - redirect to beta inscription
      console.log('[RootRedirect] No OAuth params, redirecting to /beta-inscription');
      navigate('/beta-inscription', { replace: true });
    }
  }, [navigate, location]);

  return <LoadingSpinner message="Redirection..." fullScreen />;
};

export default RootRedirect;
