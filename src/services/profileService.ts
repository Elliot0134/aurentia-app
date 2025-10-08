import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  company: string;
  created_at: string;
}

class ProfileService {
  /**
   * Fetch user profile from the profiles table
   */
  async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone, location, company, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Ensure string fields are never null to avoid runtime errors (e.g., calling .trim() on null)
      const safeData = {
        id: (data as any).id,
        email: (data as any).email ?? '',
        first_name: (data as any).first_name ?? '',
        last_name: (data as any).last_name ?? '',
        phone: (data as any).phone ?? '',
        location: (data as any).location ?? '',
        company: (data as any).company ?? '',
        created_at: (data as any).created_at ?? ''
      } as ProfileData;

      return safeData;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Update user profile in the profiles table
   */
  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {};
      
      if (updates.first_name !== undefined) updateData.first_name = updates.first_name;
      if (updates.last_name !== undefined) updateData.last_name = updates.last_name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.company !== undefined) updateData.company = updates.company;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Also update auth metadata for consistency
      const authUpdates: Record<string, any> = {};
      if (updates.first_name !== undefined) authUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) authUpdates.last_name = updates.last_name;
      if (updates.phone !== undefined) authUpdates.phone = updates.phone;
      if (updates.location !== undefined) authUpdates.location = updates.location;
      if (updates.company !== undefined) authUpdates.company = updates.company;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
          data: authUpdates
        });

        if (authError) {
          console.error('Error updating auth metadata:', authError);
          // Don't return false here, profile DB update was successful
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Sync auth metadata to profiles table
   * Useful for ensuring consistency between auth.users and profiles
   */
  async syncAuthToProfile(userId: string): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error getting auth user:', authError);
        return false;
      }

      const updateData: Record<string, any> = {
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || '',
        company: user.user_metadata?.company || '',
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error syncing auth to profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in syncAuthToProfile:', error);
      return false;
    }
  }
}

export const profileService = new ProfileService();
