import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';

// Types TypeScript pour la collaboration
export interface ProjectCollaborator {
  id: string
  project_id: string
  user_id: string
  role: 'reader' | 'editor'
  status: 'pending' | 'accepted' | 'declined'
  invited_by: string
  invited_at: string
  accepted_at?: string
  user?: {
    id: string
    email: string
    full_name?: string
  }
}

export interface ProjectInvitation {
  id: string
  project_id: string
  email: string
  role: 'reader' | 'editor'
  token: string
  invited_by: string
  invited_at: string
  expires_at: string
  used: boolean
}

export interface UserPermission {
  role: 'owner' | 'reader' | 'editor' | null
  hasAccess: boolean
}

export interface InviteResponse {
  success?: boolean
  error?: string
  token?: string
}

export class ProjectCollaborationManager {
  
  // Inviter un utilisateur existant par son ID
  async inviteUserById(
    projectId: string,
    userId: string,
    role: 'reader' | 'editor' = 'reader'
  ): Promise<InviteResponse> {
    try {
      const { data, error } = await supabase.rpc('invite_user_to_project', {
        p_project_id: projectId,
        p_user_id: userId,
        p_role: role // role is already in English
      })
      
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Erreur lors de l\'invitation:', error)
      return { error: error.message }
    }
  }

// Inviter par email
async inviteByEmail(
    projectId: string,
    email: string,
    role: 'reader' | 'editor' = 'reader'
  ): Promise<InviteResponse> {
    try {
      console.log('🔍 === DÉBUT INVITATION ===');
      console.log('📊 Paramètres:', { projectId, email, role });
      
      console.log('🔄 Role:', { role });
      
      // Vérifier l'utilisateur actuel
      const currentUser = await supabase.auth.getUser();
      console.log('👤 Utilisateur actuel:', currentUser.data.user?.id, currentUser.data.user?.email);
      
      if (!currentUser.data.user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Vérifier d'abord si l'utilisateur existe déjà
      console.log('🔍 Recherche utilisateur existant...');
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
  
      console.log('👤 Résultat recherche utilisateur:', { existingUser, userError });
  
      if (existingUser) {
        console.log('✅ Utilisateur trouvé, invitation directe...');
        const result = await this.inviteUserById(projectId, existingUser.id, role);
        console.log('📤 Résultat invitation directe:', result);
        return result;
      }
  
      console.log('📧 Utilisateur inexistant, création invitation email...');
      
      // Générer token
      const token = this.generateToken();
      console.log('🎫 Token généré:', token);
      
      // Essayer de découvrir les valeurs acceptées par la contrainte
      console.log('🧪 Découverte des valeurs de rôle acceptées...');
      
      // Tester avec des valeurs très basiques d'abord
      const rolesToTest = [
        'Lecteur',     // Français original
        'Éditeur',     // Français original
        'reader',      // Anglais minuscule
        'editor',      // Anglais minuscule
        'READER',      // Anglais majuscule
        'EDITOR',      // Anglais majuscule
        'read',        // Court
        'write',       // Court
        'view',        // Alternatif
        'edit'         // Alternatif
      ];
      
      let workingRole = role;
      
      // Si c'est reader, essayer les variantes de lecture
      if (role === 'reader') {
        workingRole = 'Lecteur'; // Essayer d'abord le français
      } else if (role === 'editor') {
        workingRole = 'Éditeur'; // Essayer d'abord le français
      }
      
      console.log('🎯 Test avec rôle:', workingRole);
      
      // Préparer les données d'insertion
      const insertData = {
        project_id: projectId,
        email: email,
        role: workingRole,
        token: token,
        invited_by: currentUser.data.user.id
      };
      console.log('📝 Données à insérer:', insertData);
      
      // Tenter l'insertion
      console.log('💾 Tentative d\'insertion dans project_invitations...');
      const { data, error } = await supabase
        .from('project_invitations')
        .insert(insertData)
        .select();
      
      console.log('📊 Résultat insertion:', { data, error });
      
      if (error) {
        console.error('❌ Erreur SQL détaillée:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('✅ Invitation créée avec succès, envoi email...');
      
      // Envoyer l'email
      try {
        await this.sendInvitationEmail(email, projectId, token);
        console.log('📧 Email envoyé avec succès');
      } catch (emailError) {
        console.warn('⚠️ Erreur envoi email:', emailError);
        // Continue même si l'email échoue
      }
      
      console.log('🎉 === INVITATION TERMINÉE AVEC SUCCÈS ===');
      return { success: true, token };
      
    } catch (error: any) {
      console.error('❌ === ERREUR INVITATION ===');
      console.error('Type:', typeof error);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error.details);
      console.error('Stack:', error.stack);
      console.error('Objet complet:', error);
      return { error: error.message };
    }
  }

  // Obtenir les collaborateurs d'un projet
  async getProjectCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          profiles:user_id (
            id,
            email
          )
        `)
        .eq('project_id', projectId)

      if (error) throw error
      
      // Convertir les rôles de la base (anglais) vers français pour l'affichage
      const collaborators = (data || []).map(collab => ({
        ...collab,
        role: collab.role === 'editor' ? 'Éditeur' : 'Lecteur'
      })) as ProjectCollaborator[]
      
      return collaborators
    } catch (error) {
      console.error('Erreur lors de la récupération des collaborateurs:', error)
      return []
    }
  }

  // Obtenir les invitations en attente pour un utilisateur
  async getUserInvitations(userId: string): Promise<ProjectCollaborator[]> {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          project_summary:project_id (
            project_id,
            nom_projet,
            description_synthetique
          ),
          inviter:invited_by (
            id,
            email
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error)
      return []
    }
  }

  // Accepter une invitation
  async acceptInvitation(invitationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        p_invitation_id: invitationId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error)
      return false
    }
  }

  // Refuser une invitation
  async declineInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .update({ status: 'declined' })
        .eq('id', invitationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors du refus de l\'invitation:', error)
      return false
    }
  }

  // Vérifier les permissions d'un utilisateur sur un projet
  async checkUserPermission(projectId: string, userId: string): Promise<UserPermission> {
    try {
      // Vérifier si l'utilisateur est le propriétaire
      const { data: project } = await supabase
        .from('project_summary')
        .select('user_id')
        .eq('project_id', projectId)
        .single()

      if (project?.user_id === userId) {
        return { role: 'owner', hasAccess: true }
      }

      // Vérifier les permissions de collaborateur
      const { data: collaboration } = await supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single()

      return {
        role: collaboration?.role || null,
        hasAccess: !!collaboration
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error)
      return { role: null, hasAccess: false }
    }
  }

  // Supprimer un collaborateur
  async removeCollaborator(projectId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du collaborateur:', error)
      return false
    }
  }

  // Fonction utilitaire pour générer un token
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Fonction pour envoyer l'email d'invitation
  private async sendInvitationEmail(email: string, projectId: string, token: string): Promise<void> {
    const invitationUrl = `${window.location.origin}/invitation?token=${token}`
    
    try {
      // Récupérer le nom du projet
      const { data: project } = await supabase
        .from('project_summary')
        .select('nom_projet')
        .eq('project_id', projectId)
        .single()

      const projectName = project?.nom_projet || 'Projet Aurentia'

      // Récupérer les variables d'environnement
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID  
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Variables EmailJS manquantes dans .env')
      }

      // Envoyer l'email via EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          project_name: projectName,
          invitation_url: invitationUrl,
          from_name: 'Aurentia'
        },
        publicKey
      )
      
      console.log('✅ Email d\'invitation envoyé avec succès à', email)
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
      
      // Fallback: afficher le lien pour que vous puissiez le partager manuellement
      console.log(`📧 Lien d'invitation pour ${email}: ${invitationUrl}`)
      
      alert(`⚠️ Email non envoyé automatiquement.\n\nVeuillez partager ce lien manuellement avec ${email}:\n\n${invitationUrl}`)
    }
  }

  // Méthode pour obtenir l'utilisateur actuel
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Méthode pour obtenir les projets de l'utilisateur
  async getUserProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('project_summary')
        .select('project_id, nom_projet, description_synthetique')
        .eq('user_id', userId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error)
      return []
    }
  }
}

// Instance par défaut
export const collaborationManager = new ProjectCollaborationManager()

// Export par défaut
export default ProjectCollaborationManager
