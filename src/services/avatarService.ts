import { supabase } from '@/integrations/supabase/client';

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload an avatar image to Supabase Storage
 */
export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<AvatarUploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Le fichier doit être une image' };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'La taille du fichier ne doit pas dépasser 2MB' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL using any to bypass type checking
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({ avatar_url: filePath })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors du téléchargement' };
  }
};

/**
 * Get the full public URL for an avatar
 */
export const getAvatarUrl = (avatarPath?: string | null): string | null => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return it
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // Otherwise, construct the Supabase storage URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarPath);
  
  return publicUrl;
};

/**
 * Delete an avatar from storage
 */
export const deleteAvatar = async (avatarPath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([avatarPath]);

    return !error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
};

/**
 * Update user profile with avatar URL
 */
export const updateUserAvatar = async (
  userId: string,
  avatarPath: string
): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ avatar_url: avatarPath })
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('Error updating user avatar:', error);
    return false;
  }
};
