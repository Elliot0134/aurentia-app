import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  assignMentorToEntrepreneur, 
  getOrganizationMentorAssignments,
  cancelMentorAssignment,
  getUnassignedEntrepreneurs,
  getAvailableMentors,
  CreateMentorAssignmentData
} from '@/services/mentorAssignmentService';

export const useMentorAssignments = () => {
  const { id: organisationId } = useParams();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizationMentorAssignments(organisationId);
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur chargement assignations:', err);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = useCallback(async (assignmentData: CreateMentorAssignmentData) => {
    try {
      const newAssignment = await assignMentorToEntrepreneur(assignmentData);
      setAssignments(prev => [newAssignment, ...prev]);
      return newAssignment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'assignation');
      throw err;
    }
  }, []);

  const cancelAssignment = useCallback(async (assignmentId: string) => {
    try {
      await cancelMentorAssignment(assignmentId);
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'cancelled' }
            : assignment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
      throw err;
    }
  }, []);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    cancelAssignment
  };
};

export const useUnassignedEntrepreneurs = () => {
  const { id: organisationId } = useParams();
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnassigned = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        const data = await getUnassignedEntrepreneurs(organisationId);
        setEntrepreneurs(data || []);
      } catch (err) {
        console.error('Erreur chargement entrepreneurs non assignés:', err);
        setEntrepreneurs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnassigned();
  }, [organisationId]);

  return { entrepreneurs, loading };
};

export const useAvailableMentors = () => {
  const { id: organisationId } = useParams();
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        const data = await getAvailableMentors(organisationId);
        setMentors(data || []);
      } catch (err) {
        console.error('Erreur chargement mentors disponibles:', err);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [organisationId]);

  return { mentors, loading };
};