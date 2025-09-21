import { useState, useEffect } from 'react';
import { 
  getOrganisationEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '../services/organisationService';

// Types pour les événements
export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: 'workshop' | 'meeting' | 'webinar' | 'networking' | 'other';
  location?: string;
  organizer_id?: string;
  is_recurring: boolean;
  max_participants?: number;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: Event['type'];
  location?: string;
  organizer_id?: string;
  is_recurring: boolean;
  max_participants?: number;
  organization_id: string;
}

export const useEvents = (organisationId: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!organisationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganisationEvents(organisationId);
      setEvents(data);
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error('Erreur chargement événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: EventFormData): Promise<boolean> => {
    try {
      const newEvent = await createEvent({
        ...eventData,
        participants: []
      });
      
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      console.error('Erreur création événement:', err);
      return false;
    }
  };

  const editEvent = async (eventId: string, updates: Partial<Event>): Promise<boolean> => {
    try {
      const updatedEvent = await updateEvent(eventId, updates);
      
      if (updatedEvent) {
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la modification de l\'événement');
      console.error('Erreur modification événement:', err);
      return false;
    }
  };

  const removeEvent = async (eventId: string): Promise<boolean> => {
    try {
      const success = await deleteEvent(eventId);
      
      if (success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la suppression de l\'événement');
      console.error('Erreur suppression événement:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [organisationId]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    editEvent,
    removeEvent
  };
};