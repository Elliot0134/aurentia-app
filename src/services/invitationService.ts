import { supabase } from '@/integrations/supabase/client';
import { UserRole, InvitationValidationResult, InvitationUsageResult } from '@/types/userTypes';

export const validateInvitationCode = async (code: string): Promise<InvitationValidationResult> => {
  try {
    // Use the new database function for validation
    const { data, error } = await supabase.rpc('validate_invitation_code', {
      p_code: code
    });

    if (error) {
      console.error('Error validating invitation code:', error);
      return { valid: false, reason: 'Erreur lors de la validation' };
    }

    if (!data || !data.valid) {
      return { valid: false, reason: 'Code invalide ou expiré' };
    }

    return {
      valid: true,
      role: data.role as UserRole, // Direct role mapping from database
      organization: data.organization_name ? {
        id: data.organization_id,
        name: data.organization_name
      } : undefined,
      codeData: {
        id: data.code,
        code: data.code,
        expires_at: data.expires_at,
        max_uses: data.max_uses,
        current_uses: data.current_uses,
        remaining_uses: data.remaining_uses,
        is_active: data.is_active,
        created_at: data.created_at
      } as any
    };
  } catch (error) {
    console.error('Error validating invitation code:', error);
    return { valid: false, reason: 'Erreur lors de la validation' };
  }
};

export const useInvitationCode = async (code: string, userId: string): Promise<InvitationUsageResult> => {
  const validation = await validateInvitationCode(code);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  try {
    // Use the new simplified redemption function
    const { data, error } = await supabase.rpc('redeem_invitation_code_v2', {
      p_code: code,
      p_user_id: userId
    });

    if (error) {
      console.error('Error redeeming invitation code:', error);
      throw new Error('Erreur lors de l\'utilisation du code d\'invitation');
    }

    if (!data || !data.success) {
      throw new Error('Échec de l\'utilisation du code d\'invitation');
    }

    return {
      userRole: data.user_role as UserRole,
      organization: validation.organization
    };
  } catch (error) {
    console.error('Error using invitation code:', error);
    throw error;
  }
};

// Créer un code d'invitation (pour les admins)
export const createInvitationCode = async (
  role: 'member' | 'staff' | 'organisation',
  organizationId: string,
  maxUses: number = 1,
  expiresAt?: string,
  customCode?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  try {
    // Use the new simplified creation function
    const { data, error } = await supabase.rpc('create_invitation_code_v2', {
      p_organization_id: organizationId,
      p_role: role,
      p_created_by: user.id,
      p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      p_max_uses: maxUses,
      p_custom_code: customCode || null
    });

    if (error) {
      console.error('Error creating invitation code:', error);
      throw new Error('Erreur lors de la création du code');
    }

    return data;
  } catch (error) {
    console.error('Error creating invitation code:', error);
    throw error;
  }
};

// Lister les codes d'invitation (pour les admins)
export const listInvitationCodes = async (organizationId: string, includeInactive: boolean = false) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  try {
    // Use the new function to get organization invitation codes
    const { data, error } = await supabase.rpc('get_organization_invitation_codes', {
      p_organization_id: organizationId,
      p_include_inactive: includeInactive
    });

    if (error) {
      console.error('Error listing invitation codes:', error);
      throw new Error('Erreur lors de la récupération des codes');
    }

    return data;
  } catch (error) {
    console.error('Error listing invitation codes:', error);
    throw error;
  }
};

// Désactiver un code d'invitation
export const deactivateInvitationCode = async (code: string) => {
  try {
    // Use the new deactivation function
    const { data, error } = await supabase.rpc('deactivate_invitation_code', {
      p_code: code
    });

    if (error) {
      console.error('Error deactivating invitation code:', error);
      throw new Error('Erreur lors de la désactivation du code');
    }

    return data; // Returns boolean indicating success
  } catch (error) {
    console.error('Error deactivating invitation code:', error);
    throw error;
  }
};

// Étendre la date d'expiration d'un code d'invitation
export const extendInvitationCodeExpiry = async (code: string, newExpiry: string) => {
  try {
    const { data, error } = await supabase.rpc('extend_invitation_code_expiry', {
      p_code: code,
      p_new_expiry: new Date(newExpiry).toISOString()
    });

    if (error) {
      console.error('Error extending invitation code expiry:', error);
      throw new Error('Erreur lors de l\'extension de la date d\'expiration');
    }

    return data; // Returns boolean indicating success
  } catch (error) {
    console.error('Error extending invitation code expiry:', error);
    throw error;
  }
};