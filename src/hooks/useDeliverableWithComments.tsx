import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDeliverableWithCommentsProps {
  projectId: string;
  deliverableType: string; // e.g., 'persona-express', 'swot', 'pitch', etc.
  deliverableTitle: string;
}

interface DeliverableInfo {
  deliverableId: string | null;
  organizationId: string | null;
  isInOrganization: boolean;
  loading: boolean;
}

/**
 * Hook to manage deliverable records and enable commenting functionality
 * This hook:
 * 1. Checks if user is in an organization
 * 2. Creates or finds a deliverable record
 * 3. Returns deliverable ID and organization ID for commenting
 */
export const useDeliverableWithComments = ({
  projectId,
  deliverableType,
  deliverableTitle,
}: UseDeliverableWithCommentsProps): DeliverableInfo => {
  const [deliverableId, setDeliverableId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isInOrganization, setIsInOrganization] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDeliverable();
  }, [projectId, deliverableType]);

  const initializeDeliverable = async () => {
    console.log('🔍 useDeliverableWithComments - Starting initialization:', {
      projectId,
      deliverableType,
      deliverableTitle
    });

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('✅ User authenticated:', user.id);

      console.log('✅ User authenticated:', user.id);

      // Check if user is in an organization
      const { data: userOrg } = await (supabase as any)
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const orgId = userOrg?.organization_id || null;
      setOrganizationId(orgId);
      setIsInOrganization(!!orgId);

      console.log('📊 Organization check:', {
        hasOrganization: !!orgId,
        organizationId: orgId
      });

      // Check if deliverable record exists
      // CRITICAL FIX: Query by type + title to get a UNIQUE deliverable per component
      // This ensures each deliverable (Persona Express, SWOT, etc.) has its own comments
      const { data: existingDeliverables } = await (supabase as any)
        .from('deliverables')
        .select('id, created_at, organization_id')
        .eq('entrepreneur_id', user.id)
        .eq('type', deliverableType)
        .eq('title', deliverableTitle)  // IMPORTANT: Include title to make it unique
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      let existingDeliverable = null;
      
      if (existingDeliverables && existingDeliverables.length > 0) {
        // Match by organization_id to handle org vs individual users correctly
        if (orgId) {
          // User is in an organization - find deliverable with matching org
          existingDeliverable = existingDeliverables.find(d => d.organization_id === orgId) || existingDeliverables[0];
        } else {
          // Individual user - find deliverable with null org
          existingDeliverable = existingDeliverables.find(d => d.organization_id === null) || existingDeliverables[0];
        }
        
        console.log(`✅ Found existing deliverable for "${deliverableTitle}":`, existingDeliverable.id);
        
        // If multiple exist, log a warning
        if (existingDeliverables.length > 1) {
          console.warn(`⚠️ Found ${existingDeliverables.length} deliverables for "${deliverableTitle}" - using correct one for org context`);
        }
      }

      if (existingDeliverable) {
        console.log('✅ Found existing deliverable:', existingDeliverable.id);
        setDeliverableId(existingDeliverable.id);
      } else {
        console.log('📝 Creating new deliverable...');
        // Create deliverable record
        const { data: newDeliverable, error: createError } = await (supabase as any)
          .from('deliverables')
          .insert({
            organization_id: orgId, // Will be null for individual users
            entrepreneur_id: user.id,
            project_id: projectId,  // Use project_id (project_summary), not new_project_id
            title: deliverableTitle,
            type: deliverableType,
            status: 'in-progress',
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating deliverable:', createError);
        } else if (newDeliverable) {
          console.log('✅ Created new deliverable:', newDeliverable.id);
          setDeliverableId(newDeliverable.id);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing deliverable:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Hook initialization complete');
    }
  };

  return {
    deliverableId,
    organizationId,
    isInOrganization,
    loading,
  };
};
