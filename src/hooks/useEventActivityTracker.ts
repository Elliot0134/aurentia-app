import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { logEventActivity } from '@/services/recentActivityService';
import { Event } from '@/services/organisationService';

export const useEventActivityTracker = () => {
  const { id: organisationId } = useParams();
  const { userProfile } = useUserProfile();

  const logActivity = useCallback(async (
    eventId: string,
    eventTitle: string,
    activityType: 'event_updated' | 'event_participant_added' | 'event_participant_removed' | 'event_moved',
    description: string,
    metadata?: Record<string, any>
  ) => {
    if (!organisationId || !userProfile?.id) return;

    await logEventActivity(
      organisationId,
      eventId,
      eventTitle,
      activityType,
      description,
      userProfile.id,
      metadata
    );
  }, [organisationId, userProfile?.id]);

  const trackEventUpdate = useCallback(async (
    event: Event,
    changes: Partial<Event>,
    previousValues?: Partial<Event>
  ) => {
    const changeDescriptions = [];
    
    if (changes.title && changes.title !== previousValues?.title) {
      changeDescriptions.push(`titre modifié de "${previousValues?.title}" vers "${changes.title}"`);
    }
    
    if (changes.location && changes.location !== previousValues?.location) {
      changeDescriptions.push(`lieu modifié vers "${changes.location}"`);
    }
    
    if (changes.start_date && changes.start_date !== previousValues?.start_date) {
      const newDate = new Date(changes.start_date).toLocaleDateString('fr-FR');
      changeDescriptions.push(`date modifiée vers ${newDate}`);
    }
    
    if (changes.max_participants && changes.max_participants !== previousValues?.max_participants) {
      changeDescriptions.push(`nombre max de participants modifié vers ${changes.max_participants}`);
    }
    
    if (changes.status && changes.status !== previousValues?.status) {
      changeDescriptions.push(`statut modifié vers "${changes.status}"`);
    }

    if (changeDescriptions.length > 0) {
      const description = `Événement "${event.title}" modifié: ${changeDescriptions.join(', ')}`;
      await logActivity(
        event.id,
        event.title,
        'event_updated',
        description,
        { changes, previousValues }
      );
    }
  }, [logActivity]);

  const trackParticipantAdded = useCallback(async (
    event: Event,
    participantNames: string[]
  ) => {
    const description = participantNames.length === 1
      ? `${participantNames[0]} a été ajouté(e) à l'événement "${event.title}"`
      : `${participantNames.length} participants ont été ajoutés à l'événement "${event.title}"`;
    
    await logActivity(
      event.id,
      event.title,
      'event_participant_added',
      description,
      { participants: participantNames }
    );
  }, [logActivity]);

  const trackParticipantRemoved = useCallback(async (
    event: Event,
    participantNames: string[]
  ) => {
    const description = participantNames.length === 1
      ? `${participantNames[0]} a été retiré(e) de l'événement "${event.title}"`
      : `${participantNames.length} participants ont été retirés de l'événement "${event.title}"`;
    
    await logActivity(
      event.id,
      event.title,
      'event_participant_removed',
      description,
      { participants: participantNames }
    );
  }, [logActivity]);

  const trackEventMoved = useCallback(async (
    event: Event,
    newStartDate: string,
    newEndDate: string,
    previousStartDate?: string
  ) => {
    const newDate = new Date(newStartDate).toLocaleDateString('fr-FR');
    const newTime = new Date(newStartDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    let description = `Événement "${event.title}" déplacé vers le ${newDate} à ${newTime}`;
    
    if (previousStartDate) {
      const oldDate = new Date(previousStartDate).toLocaleDateString('fr-FR');
      const oldTime = new Date(previousStartDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      description = `Événement "${event.title}" déplacé du ${oldDate} ${oldTime} vers le ${newDate} ${newTime}`;
    }
    
    await logActivity(
      event.id,
      event.title,
      'event_moved',
      description,
      { 
        newStartDate, 
        newEndDate, 
        previousStartDate,
        newFormattedDate: `${newDate} ${newTime}`
      }
    );
  }, [logActivity]);

  return {
    trackEventUpdate,
    trackParticipantAdded,
    trackParticipantRemoved,
    trackEventMoved
  };
};