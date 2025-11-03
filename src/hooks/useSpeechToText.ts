import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { recordAndTranscribeAudio } from '@/services/audioService';
import { useUser } from '@/contexts/UserContext';
import { useProject } from '@/contexts/ProjectContext';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

export interface UseSpeechToTextOptions {
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: Error) => void;
  maxDurationSeconds?: number;
  projectId?: string | null;
  questionContext?: string;
}

export interface UseSpeechToTextReturn {
  recordingState: RecordingState;
  isRecording: boolean;
  isProcessing: boolean;
  remainingTime: number; // Countdown from maxDuration to 0
  timeUsed: number; // How many seconds were used
  transcribedText: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  error: Error | null;
}

/**
 * Custom hook for speech-to-text recording with n8n transcription
 */
export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
  const {
    onTranscriptionComplete,
    onError,
    maxDurationSeconds = 120, // 2 minutes max by default
    projectId: customProjectId,
    questionContext,
  } = options;

  const { userProfile } = useUser();
  const { currentProjectId } = useProject();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [remainingTime, setRemainingTime] = useState(maxDurationSeconds); // Countdown
  const [timeUsed, setTimeUsed] = useState(0); // Track actual time used
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Use custom project ID or context project ID
  const projectId = customProjectId !== undefined ? customProjectId : currentProjectId;

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (!userProfile?.id) {
        throw new Error('Vous devez être connecté pour utiliser cette fonctionnalité');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Clear previous recording data
      audioChunksRef.current = [];
      setTranscribedText(null);
      setError(null);
      setRemainingTime(maxDurationSeconds); // Reset countdown
      setTimeUsed(0); // Reset time used
      startTimeRef.current = Date.now();

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle stop event
      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        // Clear duration interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        const recordingError = new Error('Erreur lors de l\'enregistrement audio');
        setError(recordingError);
        setRecordingState('error');
        onError?.(recordingError);

        toast({
          title: 'Erreur d\'enregistrement',
          description: 'Une erreur est survenue lors de l\'enregistrement',
          variant: 'destructive',
        });
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');

      // Start countdown timer
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remaining = Math.max(0, maxDurationSeconds - elapsed);

          setRemainingTime(remaining);
          setTimeUsed(elapsed);

          // Auto-stop if countdown reaches 0
          if (remaining <= 0) {
            stopRecording();
            toast({
              title: 'Temps écoulé',
              description: 'Enregistrement terminé automatiquement',
            });
          }
        }
      }, 1000);

      toast({
        title: 'Enregistrement en cours',
        description: 'Parlez maintenant...',
      });
    } catch (err) {
      console.error('Error starting recording:', err);

      let errorMessage = 'Impossible de démarrer l\'enregistrement';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permission du microphone refusée';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Aucun microphone détecté';
        }
      }

      const recordingError = new Error(errorMessage);
      setError(recordingError);
      setRecordingState('error');
      onError?.(recordingError);

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [userProfile, maxDurationSeconds, onError]);

  /**
   * Stop recording and transcribe
   */
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || recordingState !== 'recording') {
      return;
    }

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      // Set up the stop handler
      mediaRecorder.addEventListener(
        'stop',
        async () => {
          try {
            setRecordingState('processing');

            // Create audio blob
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/mp3',
            });

            if (audioBlob.size === 0) {
              throw new Error('Aucun audio enregistré');
            }

            // Get actual time used
            const durationSeconds = timeUsed;

            // Transcribe with n8n
            const result = await recordAndTranscribeAudio(
              audioBlob,
              userProfile!.id,
              projectId || null,
              durationSeconds,
              questionContext
            );

            setTranscribedText(result.text);
            setRecordingState('idle');
            onTranscriptionComplete?.(result.text);

            toast({
              title: 'Transcription terminée',
              description: 'Le texte a été transcrit avec succès',
            });

            resolve();
          } catch (err) {
            console.error('Error transcribing audio:', err);

            const transcriptionError =
              err instanceof Error ? err : new Error('Erreur de transcription');

            setError(transcriptionError);
            setRecordingState('error');
            onError?.(transcriptionError);

            toast({
              title: 'Erreur de transcription',
              description: transcriptionError.message,
              variant: 'destructive',
            });

            resolve();
          }
        },
        { once: true }
      );

      // Stop the recorder
      mediaRecorder.stop();
    });
  }, [
    recordingState,
    timeUsed,
    userProfile,
    projectId,
    onTranscriptionComplete,
    onError,
  ]);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      setRemainingTime(maxDurationSeconds);
      setTimeUsed(0);
      setRecordingState('idle');

      toast({
        title: 'Enregistrement annulé',
        description: 'L\'enregistrement a été annulé',
      });
    }
  }, [recordingState, maxDurationSeconds]);

  return {
    recordingState,
    isRecording: recordingState === 'recording',
    isProcessing: recordingState === 'processing',
    remainingTime,
    timeUsed,
    transcribedText,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
}
