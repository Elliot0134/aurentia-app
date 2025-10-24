import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export interface StaffPermissions {
  canManageNewsletters: boolean;
  canManageOrgMessages: boolean;
  isOwner: boolean;
  isLoading: boolean;
}

/**
 * Hook to check staff permissions for newsletters and messaging
 * Returns permissions based on user role and organization settings
 */
export const useStaffPermissions = (): StaffPermissions => {
  const { userRole, organizationId, loading: roleLoading } = useUserRole();

  const { data, isLoading } = useQuery({
    queryKey: ["staff-permissions", organizationId, userRole],
    queryFn: async () => {
      // If no organization, no permissions
      if (!organizationId) {
        return {
          canManageNewsletters: false,
          canManageOrgMessages: false,
          isOwner: false,
        };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user");
      }

      // Organization owners have all permissions by default
      if (userRole === "organisation") {
        return {
          canManageNewsletters: true,
          canManageOrgMessages: true,
          isOwner: true,
        };
      }

      // For staff members, check user_organizations table
      if (userRole === "staff") {
        const { data: userOrg, error } = await supabase
          .from("user_organizations")
          .select("can_manage_newsletters, can_manage_org_messages")
          .eq("user_id", user.id)
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .single();

        if (error) {
          console.error("Error fetching staff permissions:", error);
          return {
            canManageNewsletters: false,
            canManageOrgMessages: false,
            isOwner: false,
          };
        }

        return {
          canManageNewsletters: userOrg?.can_manage_newsletters ?? false,
          canManageOrgMessages: userOrg?.can_manage_org_messages ?? false,
          isOwner: false,
        };
      }

      // Members and mentors have no org management permissions
      return {
        canManageNewsletters: false,
        canManageOrgMessages: false,
        isOwner: false,
      };
    },
    enabled: !roleLoading && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    canManageNewsletters: data?.canManageNewsletters ?? false,
    canManageOrgMessages: data?.canManageOrgMessages ?? false,
    isOwner: data?.isOwner ?? false,
    isLoading: roleLoading || isLoading,
  };
};
