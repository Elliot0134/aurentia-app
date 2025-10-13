import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrganisationRouteGuardProps {
  children: React.ReactNode;
  requireOwner?: boolean; // New prop to require owner role
}

/**
 * OrganisationRouteGuard Component
 * 
 * Simple guard that protects organization routes.
 * 
 * Access Rules (KISS principle):
 * 1. Only 'organisation', 'staff', or 'super_admin' roles can access
 * 2. User MUST have an organizationId (active entry in user_organizations table)
 * 3. If user has role but no organizationId → redirect to /setup-organization
 * 4. If user doesn't have role → redirect to appropriate dashboard
 * 5. If requireOwner is true, only organization owner can access
 * 
 * NO checks for organization_setup_pending or other complex conditions
 * This prevents infinite redirect loops
 */
const OrganisationRouteGuard = ({ children, requireOwner = false }: OrganisationRouteGuardProps) => {
  const { userRole, organizationId, loading, userProfile } = useUserRole();
  const { id: orgIdFromUrl } = useParams();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [checkingOwnership, setCheckingOwnership] = useState(requireOwner);
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  console.log('[OrganisationRouteGuard] Path:', location.pathname, '| Role:', userRole, '| OrgID:', organizationId, '| Loading:', loading);

  // Reset redirect ref when path changes
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [location.pathname]);

  // Check if user is owner when requireOwner is true
  useEffect(() => {
    const checkOwnership = async () => {
      if (!requireOwner || !userProfile?.id || !orgIdFromUrl) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from('organizations')
          .select('created_by')
          .eq('id', orgIdFromUrl)
          .single();

        if (error) throw error;
        
        setIsOwner(data?.created_by === userProfile.id);
      } catch (error) {
        console.error('[OrganisationRouteGuard] Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [requireOwner, userProfile?.id, orgIdFromUrl]);

  // Wait for loading to complete before making ANY decisions
  if (loading || checkingOwnership) {
    return <LoadingSpinner message="Vérification des permissions..." fullScreen />;
  }

  // Check if user has the right role to access organization routes
  const hasOrgRole = userRole === 'organisation' || userRole === 'staff' || userRole === 'super_admin';

  if (!hasOrgRole) {
    console.log('[OrganisationRouteGuard] No org role, redirecting based on user role');
    
    if (hasRedirectedRef.current) {
      console.log('[OrganisationRouteGuard] Already redirected, preventing loop');
      return null;
    }
    
    hasRedirectedRef.current = true;
    
    // Redirect members to their member space
    if (userRole === 'member') {
      return <Navigate to="/individual/my-organization" replace />;
    }
    
    // Redirect individuals to their dashboard
    if (userRole === 'individual') {
      return <Navigate to="/individual/dashboard" replace />;
    }
    
    // Default: redirect to login
    return <Navigate to="/login" replace />;
  }

  // User has org role - check if they belong to an organization
  // This is the ONLY check for organization access: user_organizations table
  if (!organizationId) {
    console.log('[OrganisationRouteGuard] Has org role but no organizationId - redirect to setup');
    
    if (hasRedirectedRef.current) {
      console.log('[OrganisationRouteGuard] Already redirected, preventing loop');
      return null;
    }
    
    hasRedirectedRef.current = true;
    return <Navigate to="/setup-organization" replace />;
  }

  // If owner is required, check ownership
  if (requireOwner && isOwner === false) {
    console.log('[OrganisationRouteGuard] Owner access required but user is not owner - redirect to dashboard');
    return <Navigate to={`/organisation/${organizationId}/dashboard`} replace />;
  }

  // All checks passed - grant access
  console.log('[OrganisationRouteGuard] Access granted');
  return <>{children}</>;
};

export default OrganisationRouteGuard;