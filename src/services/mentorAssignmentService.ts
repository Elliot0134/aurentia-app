import { supabase } from '@/integrations/supabase/client';

export interface MentorAssignment {
  id: string;
  mentor_id: string;
  entrepreneur_id: string;
  project_id?: string;
  assigned_at: string;
  assigned_by?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  mentor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    expertise: string[];
  };
  entrepreneur?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateMentorAssignmentData {
  mentor_id: string;
  entrepreneur_id: string;
  project_id?: string;
  notes?: string;
}

// Assigner un mentor à un entrepreneur
export const assignMentorToEntrepreneur = async (assignmentData: CreateMentorAssignmentData): Promise<any> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  try {
    // Désactiver les assignations précédentes pour cet entrepreneur
    const { error: updateError } = await supabase
      .from('mentor_assignments' as any)
      .update({ status: 'completed' })
      .eq('entrepreneur_id', assignmentData.entrepreneur_id)
      .eq('status', 'active');

    if (updateError) {
      console.warn('Erreur lors de la désactivation des assignations précédentes:', updateError);
    }

    // Créer la nouvelle assignation
    const { data, error } = await supabase
      .from('mentor_assignments' as any)
      .insert({
        mentor_id: assignmentData.mentor_id,
        entrepreneur_id: assignmentData.entrepreneur_id,
        project_id: assignmentData.project_id || null,
        assigned_by: user.id,
        notes: assignmentData.notes || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'assignation: ${error.message}`);
    }

    // Mettre à jour le compteur du mentor (simple incrément)
    const { error: mentorUpdateError } = await supabase
      .from('mentors' as any)
      .update({ 
        total_entrepreneurs: (await supabase
          .from('mentor_assignments' as any)
          .select('id', { count: 'exact' })
          .eq('mentor_id', assignmentData.mentor_id)
          .eq('status', 'active')
        ).count || 0
      })
      .eq('id', assignmentData.mentor_id);

    if (mentorUpdateError) {
      console.warn('Erreur lors de la mise à jour du compteur mentor:', mentorUpdateError);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'assignation mentor-entrepreneur:', error);
    throw error;
  }
};

// Récupérer les assignations d'une organisation
export const getOrganizationMentorAssignments = async (organizationId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('mentor_assignments' as any)
      .select('*')
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des assignations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des assignations:', error);
    throw error;
  }
};

// Annuler une assignation
export const cancelMentorAssignment = async (assignmentId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  try {
    const { error } = await supabase
      .from('mentor_assignments' as any)
      .update({ 
        status: 'cancelled',
        notes: 'Assignation annulée'
      })
      .eq('id', assignmentId);

    if (error) {
      throw new Error(`Erreur lors de l'annulation: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'assignation:', error);
    throw error;
  }
};

// Récupérer les entrepreneurs sans mentor pour une organisation
export const getUnassignedEntrepreneurs = async (organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles' as any)
      .select(`
        id,
        first_name,
        last_name,
        email,
        created_at
      `)
      .eq('organization_id', organizationId)
      .eq('user_role', 'member')
      .not('id', 'in', `(
        SELECT entrepreneur_id 
        FROM mentor_assignments 
        WHERE status = 'active'
      )`);

    if (error) {
      throw new Error(`Erreur lors de la récupération des entrepreneurs: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des entrepreneurs non assignés:', error);
    throw error;
  }
};

// Récupérer les mentors disponibles pour une organisation
export const getAvailableMentors = async (organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from('mentors' as any)
      .select(`
        id,
        expertise,
        bio,
        total_entrepreneurs,
        status,
        profiles!mentors_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Erreur lors de la récupération des mentors: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des mentors disponibles:', error);
    throw error;
  }
};