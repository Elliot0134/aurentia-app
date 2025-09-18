import { supabase } from '@/integrations/supabase/client';
import { CODE_TO_ROLE_MAPPING, UserRole, InvitationValidationResult, InvitationUsageResult } from '@/types/userTypes';

export const validateInvitationCode = async (code: string): Promise<InvitationValidationResult> => {
  try {
    const { data: directData, error: directError } = await supabase
      .from('invitation_code' as any)
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (directError || !directData) {
      return { valid: false, reason: 'Code invalide' };
    }

    const codeData = directData as any;
    
    // Vérifier expiration
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return { valid: false, reason: 'Code expiré' };
    }
    
    // Vérifier usage
    if (codeData.current_uses >= codeData.max_uses) {
      return { valid: false, reason: 'Code épuisé' };
    }

    // Récupérer l'organisation si nécessaire
    let organization = undefined;
    if (codeData.organization_id) {
      const { data: orgData } = await supabase
        .from('organizations' as any)
        .select('*')
        .eq('id', codeData.organization_id)
        .single();
      organization = orgData;
    }

    return {
      valid: true,
      role: CODE_TO_ROLE_MAPPING[codeData.type as keyof typeof CODE_TO_ROLE_MAPPING],
      organization,
      codeData: codeData as any
    };
  } catch (error) {
    console.error('Erreur validation code:', error);
    return { valid: false, reason: 'Erreur lors de la validation' };
  }
};

export const useInvitationCode = async (code: string, userId: string): Promise<InvitationUsageResult> => {
  const validation = await validateInvitationCode(code);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  try {
    // 1. Incrémenter usage du code
    const { error: codeUpdateError } = await supabase
      .from('invitation_code' as any)
      .update({ current_uses: (validation.codeData as any).current_uses + 1 })
      .eq('code', code);

    if (codeUpdateError) {
      throw new Error('Erreur lors de la mise à jour du code');
    }

    // 2. Mettre à jour le profil utilisateur
    const { error: profileUpdateError } = await supabase
      .from('profiles' as any)
      .update({
        user_role: validation.role,
        organization_id: validation.organization?.id || null,
        invitation_code_used: code
      })
      .eq('id', userId);

    if (profileUpdateError) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }

    return {
      userRole: validation.role!,
      organization: validation.organization
    };
  } catch (error) {
    console.error('Erreur utilisation code:', error);
    throw error;
  }
};

// Créer un code d'invitation (pour les admins)
export const createInvitationCode = async (
  type: 'super_admin' | 'incubator_main_admin' | 'incubator_member',
  organizationId?: string,
  maxUses: number = 1,
  expiresAt?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  // Générer un code unique
  const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const { data, error } = await supabase
    .from('invitation_code' as any)
    .insert({
      code,
      type,
      organization_id: organizationId || null,
      created_by: user.id,
      max_uses: maxUses,
      expires_at: expiresAt || null,
      current_uses: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la création du code');
  }

  return data;
};

// Lister les codes d'invitation (pour les admins)
export const listInvitationCodes = async (organizationId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  let query = supabase
    .from('invitation_code' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Erreur lors de la récupération des codes');
  }

  return data;
};

// Désactiver un code d'invitation
export const deactivateInvitationCode = async (codeId: string) => {
  const { error } = await supabase
    .from('invitation_code' as any)
    .update({ is_active: false })
    .eq('id', codeId);

  if (error) {
    throw new Error('Erreur lors de la désactivation du code');
  }

  return true;
};