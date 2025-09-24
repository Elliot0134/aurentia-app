import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/services/organisationService';
import { EVENT_TYPE_COLORS } from '@/lib/eventConstants';

export const useEventTypeColors = (organizationId: string | undefined) => {
  const [eventTypeColors, setEventTypeColors] = useState<Record<Event['type'], string>>(EVENT_TYPE_COLORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventTypeColors = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('organizations')
        .select('event_type_colors')
        .eq('id', organizationId)
        .single();

      if (error) {
        console.error('Error fetching event type colors:', error);
        setError('Erreur lors du chargement des couleurs');
        return;
      }

      if (data?.event_type_colors) {
        setEventTypeColors(data.event_type_colors);
      }
    } catch (err) {
      console.error('Error in fetchEventTypeColors:', err);
      setError('Erreur lors du chargement des couleurs');
    } finally {
      setLoading(false);
    }
  };

  const updateEventTypeColor = async (type: Event['type'], color: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const newColors = { ...eventTypeColors, [type]: color };
      
      const { error } = await (supabase as any)
        .from('organizations')
        .update({ event_type_colors: newColors })
        .eq('id', organizationId);

      if (error) {
        console.error('Error updating event type color:', error);
        return false;
      }

      setEventTypeColors(newColors);
      return true;
    } catch (err) {
      console.error('Error in updateEventTypeColor:', err);
      return false;
    }
  };

  const resetToDefaultColors = async (): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const { error } = await (supabase as any)
        .from('organizations')
        .update({ event_type_colors: EVENT_TYPE_COLORS })
        .eq('id', organizationId);

      if (error) {
        console.error('Error resetting event type colors:', error);
        return false;
      }

      setEventTypeColors(EVENT_TYPE_COLORS);
      return true;
    } catch (err) {
      console.error('Error in resetToDefaultColors:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchEventTypeColors();
  }, [organizationId]);

  return {
    eventTypeColors,
    loading,
    error,
    updateEventTypeColor,
    resetToDefaultColors,
    refetch: fetchEventTypeColors
  };
};