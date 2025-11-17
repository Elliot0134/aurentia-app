import { supabase } from '@/integrations/supabase/client';
import { ProjectShareCode, CollaboratorRole } from '@/types/collaboration';

export class ShareCodeService {
  /**
   * Generate a new share code for a project
   */
  static async createShareCode(
    projectId: string,
    role: Exclude<CollaboratorRole, 'owner'>, // Can't share owner role
    maxUses: number = 5,
    expiresInDays?: number
  ): Promise<{ success: boolean; shareCode?: ProjectShareCode; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Generate unique code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_share_code');

      if (codeError || !codeData) {
        return { success: false, error: 'Failed to generate code' };
      }

      const code = codeData as string;

      // Calculate expiration date if provided
      let expiresAt: string | undefined;
      if (expiresInDays) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + expiresInDays);
        expiresAt = expDate.toISOString();
      }

      // Create share code record
      const { data, error } = await supabase
        .from('project_share_codes')
        .insert({
          project_id: projectId,
          code,
          role,
          created_by: user.id,
          max_uses: maxUses,
          current_uses: 0,
          expires_at: expiresAt,
          is_active: true
        })
        .select(`
          *,
          creator:created_by(id, email),
          project:project_id(project_id, nom_projet)
        `)
        .single();

      if (error) {
        console.error('Error creating share code:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        shareCode: this.formatShareCode(data)
      };
    } catch (error: any) {
      console.error('Error in createShareCode:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all active share codes for a project
   */
  static async getProjectShareCodes(projectId: string): Promise<ProjectShareCode[]> {
    try {
      const { data, error } = await supabase
        .from('project_share_codes')
        .select(`
          *,
          creator:created_by(id, email),
          project:project_id(project_id, nom_projet)
        `)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching share codes:', error);
        return [];
      }

      return (data || []).map(this.formatShareCode);
    } catch (error) {
      console.error('Error in getProjectShareCodes:', error);
      return [];
    }
  }

  /**
   * Validate and get share code details
   */
  static async validateShareCode(code: string): Promise<{
    valid: boolean;
    shareCode?: ProjectShareCode;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('project_share_codes')
        .select(`
          *,
          creator:created_by(id, email),
          project:project_id(project_id, nom_projet)
        `)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Code invalide ou inexistant' };
      }

      const shareCode = this.formatShareCode(data);

      // Check if expired
      if (shareCode.expires_at) {
        const now = new Date();
        const expiresAt = new Date(shareCode.expires_at);
        if (now > expiresAt) {
          return { valid: false, error: 'Ce code a expiré' };
        }
      }

      // Check if max uses reached
      if (shareCode.current_uses >= shareCode.max_uses) {
        return { valid: false, error: 'Ce code a atteint le nombre maximum d\'utilisations' };
      }

      return { valid: true, shareCode };
    } catch (error: any) {
      console.error('Error validating share code:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Use a share code to join a project
   */
  static async useShareCode(
    code: string,
    userId: string
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      // Validate code first
      const validation = await this.validateShareCode(code);
      if (!validation.valid || !validation.shareCode) {
        return { success: false, error: validation.error };
      }

      const shareCode = validation.shareCode;

      // Check if user is already a collaborator
      const { data: existingCollab } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', shareCode.project_id)
        .eq('user_id', userId)
        .single();

      if (existingCollab) {
        return { success: false, error: 'Vous êtes déjà collaborateur sur ce projet' };
      }

      // Add user as collaborator
      const { error: collabError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: shareCode.project_id,
          user_id: userId,
          role: shareCode.role,
          status: 'active'
        });

      if (collabError) {
        console.error('Error adding collaborator:', collabError);
        return { success: false, error: 'Impossible de rejoindre le projet' };
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('project_share_codes')
        .update({
          current_uses: shareCode.current_uses + 1
        })
        .eq('id', shareCode.id);

      if (updateError) {
        console.warn('Error updating share code usage:', updateError);
        // Don't fail the operation if usage count update fails
      }

      return {
        success: true,
        projectId: shareCode.project_id
      };
    } catch (error: any) {
      console.error('Error using share code:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deactivate a share code
   */
  static async deactivateShareCode(codeId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('project_share_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) {
        console.error('Error deactivating share code:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deactivateShareCode:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a share code permanently
   */
  static async deleteShareCode(codeId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('project_share_codes')
        .delete()
        .eq('id', codeId);

      if (error) {
        console.error('Error deleting share code:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteShareCode:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format share code data from database
   */
  private static formatShareCode(data: any): ProjectShareCode {
    return {
      id: data.id,
      project_id: data.project_id,
      code: data.code,
      role: data.role as CollaboratorRole,
      created_by: data.created_by,
      max_uses: data.max_uses,
      current_uses: data.current_uses,
      expires_at: data.expires_at,
      created_at: data.created_at,
      is_active: data.is_active,
      creator: data.creator ? {
        id: data.creator.id,
        email: data.creator.email
      } : undefined,
      project: data.project ? {
        project_id: data.project.project_id,
        nom_projet: data.project.nom_projet
      } : undefined
    };
  }

  /**
   * Check if a share code is close to expiring (within 24 hours)
   */
  static isExpiringSoon(shareCode: ProjectShareCode): boolean {
    if (!shareCode.expires_at) return false;

    const now = new Date();
    const expiresAt = new Date(shareCode.expires_at);
    const hoursDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDiff > 0 && hoursDiff < 24;
  }

  /**
   * Check if a share code is almost at max uses (>= 80% used)
   */
  static isAlmostFull(shareCode: ProjectShareCode): boolean {
    return (shareCode.current_uses / shareCode.max_uses) >= 0.8;
  }
}
