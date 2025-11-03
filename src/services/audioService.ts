import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AudioRecordingMetadata {
  id: string;
  user_id: string;
  project_id: string | null;
  storage_path: string;
  file_name: string;
  file_size: number;
  duration_seconds?: number;
  transcribed_text?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptionResult {
  text: string;
  audioId: string;
}

const N8N_WEBHOOK_URL = 'https://n8n.srv906204.hstgr.cloud/webhook/audio-to-text';

/**
 * Upload audio file to Supabase Storage
 */
export async function uploadAudioToStorage(
  audioBlob: Blob,
  userId: string,
  projectId: string | null
): Promise<{ storagePath: string; fileName: string; fileSize: number }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `recording_${timestamp}.mp3`;
    const storagePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(storagePath, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Échec de l'upload audio: ${uploadError.message}`);
    }

    return {
      storagePath: uploadData.path,
      fileName,
      fileSize: audioBlob.size,
    };
  } catch (error) {
    console.error('Error in uploadAudioToStorage:', error);
    throw error;
  }
}

/**
 * Create audio record in database
 */
export async function createAudioRecord(
  userId: string,
  projectId: string | null,
  storagePath: string,
  fileName: string,
  fileSize: number,
  durationSeconds?: number
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('audio')
      .insert({
        user_id: userId,
        project_id: projectId,
        storage_path: storagePath,
        file_name: fileName,
        file_size: fileSize,
        duration_seconds: durationSeconds,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Échec de l'enregistrement en base: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error in createAudioRecord:', error);
    throw error;
  }
}

/**
 * Update audio record status and transcription
 */
export async function updateAudioRecord(
  audioId: string,
  updates: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    transcribed_text?: string;
    error_message?: string;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audio')
      .update(updates)
      .eq('id', audioId);

    if (error) {
      console.error('Database update error:', error);
      throw new Error(`Échec de la mise à jour: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateAudioRecord:', error);
    throw error;
  }
}

/**
 * Send audio to n8n webhook for transcription
 */
export async function transcribeAudioWithN8n(
  audioBlob: Blob,
  audioId: string,
  questionContext?: string
): Promise<string> {
  try {
    // Update status to processing
    await updateAudioRecord(audioId, { status: 'processing' });

    // Create FormData with audio file
    const formData = new FormData();
    formData.append('data', audioBlob, 'audio.mp3');
    formData.append('audioId', audioId);

    // Add question context if provided
    if (questionContext) {
      formData.append('questionContext', questionContext);
    }

    // Send to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Extract transcribed text from response
    // Adjust this based on your n8n workflow response format
    const transcribedText = result.text || result.transcription || result.data || '';

    if (!transcribedText) {
      throw new Error('Aucun texte transcrit reçu de n8n');
    }

    // Update database with transcription
    await updateAudioRecord(audioId, {
      status: 'completed',
      transcribed_text: transcribedText,
    });

    return transcribedText;
  } catch (error) {
    console.error('Error in transcribeAudioWithN8n:', error);

    // Update status to failed
    await updateAudioRecord(audioId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Get audio file URL from storage
 */
export async function getAudioFileUrl(storagePath: string): Promise<string> {
  try {
    const { data } = await supabase.storage
      .from('audio-recordings')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (!data?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getAudioFileUrl:', error);
    throw error;
  }
}

/**
 * Delete audio recording (both storage and database)
 */
export async function deleteAudioRecording(audioId: string): Promise<void> {
  try {
    // Get audio record to find storage path
    const { data: audioRecord, error: fetchError } = await supabase
      .from('audio')
      .select('storage_path')
      .eq('id', audioId)
      .single();

    if (fetchError) {
      throw new Error(`Échec de récupération: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('audio-recordings')
      .remove([audioRecord.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue to delete database record even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('audio')
      .delete()
      .eq('id', audioId);

    if (deleteError) {
      throw new Error(`Échec de suppression: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error in deleteAudioRecording:', error);
    throw error;
  }
}

/**
 * Get user's audio recordings
 */
export async function getUserAudioRecordings(
  userId: string,
  projectId?: string | null
): Promise<AudioRecordingMetadata[]> {
  try {
    let query = supabase
      .from('audio')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectId !== undefined) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Échec de récupération: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserAudioRecordings:', error);
    throw error;
  }
}

/**
 * Main function: Record, upload, and transcribe audio
 */
export async function recordAndTranscribeAudio(
  audioBlob: Blob,
  userId: string,
  projectId: string | null,
  durationSeconds?: number,
  questionContext?: string
): Promise<TranscriptionResult> {
  try {
    // 1. Upload to storage
    const { storagePath, fileName, fileSize } = await uploadAudioToStorage(
      audioBlob,
      userId,
      projectId
    );

    // 2. Create database record
    const audioId = await createAudioRecord(
      userId,
      projectId,
      storagePath,
      fileName,
      fileSize,
      durationSeconds
    );

    // 3. Transcribe with n8n
    const transcribedText = await transcribeAudioWithN8n(audioBlob, audioId, questionContext);

    return {
      text: transcribedText,
      audioId,
    };
  } catch (error) {
    console.error('Error in recordAndTranscribeAudio:', error);
    toast({
      title: 'Erreur de transcription',
      description:
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la transcription',
      variant: 'destructive',
    });
    throw error;
  }
}
