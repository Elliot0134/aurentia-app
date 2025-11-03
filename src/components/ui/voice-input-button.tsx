import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSpeechToText, UseSpeechToTextOptions } from '@/hooks/useSpeechToText';
import { useVoiceQuota } from '@/contexts/VoiceQuotaContext';
import { cn } from '@/lib/utils';

export interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  projectId?: string | null;
  maxDurationSeconds?: number;
  disabled?: boolean;
  showDuration?: boolean;
}

/**
 * Voice input button component with recording indicator
 * Integrates with n8n for speech-to-text transcription
 */
export function VoiceInputButton({
  onTranscript,
  className,
  size = 'icon',
  variant = 'ghost',
  projectId,
  maxDurationSeconds = 120,
  disabled = false,
  showDuration = true,
}: VoiceInputButtonProps) {
  const speechToTextOptions: UseSpeechToTextOptions = {
    onTranscriptionComplete: onTranscript,
    maxDurationSeconds,
    projectId,
  };

  const {
    recordingState,
    isRecording,
    isProcessing,
    remainingTime,
    startRecording,
    stopRecording,
  } = useSpeechToText(speechToTextOptions);

  const handleClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (!isProcessing) {
      await startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTooltipText = () => {
    if (disabled) return 'Enregistrement vocal désactivé';
    if (isProcessing) return 'Transcription en cours...';
    if (isRecording) return 'Arrêter l\'enregistrement';
    return 'Enregistrer un message vocal';
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showDuration && size !== 'icon' && (
            <span className="ml-2 text-xs">Transcription...</span>
          )}
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4 fill-current" />
          {showDuration && size !== 'icon' && (
            <span className="ml-2 text-xs font-mono">{formatDuration(remainingTime)}</span>
          )}
        </>
      );
    }

    return <Mic className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size={size}
            variant={variant}
            onClick={handleClick}
            disabled={disabled || isProcessing}
            className={cn(
              'relative transition-all',
              isRecording && 'animate-pulse text-red-500 hover:text-red-600',
              isProcessing && 'cursor-wait',
              className
            )}
            aria-label={getTooltipText()}
          >
            {getButtonContent()}

            {/* Recording indicator dot */}
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
          {isRecording && showDuration && (
            <p className="text-xs text-muted-foreground mt-1">
              Décompte: {formatDuration(remainingTime)}s
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Voice input button for inline use with input fields
 * WITH TIME QUOTA MANAGEMENT (30 seconds max per field)
 */
export interface VoiceInputFieldButtonProps {
  fieldId: string; // Unique identifier for this field (for quota tracking)
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  onTranscript?: (text: string) => void;
  questionContext?: string; // The question text to help AI understand context
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  projectId?: string | null;
  disabled?: boolean;
  showDuration?: boolean;
}

export function VoiceInputFieldButton({
  fieldId,
  inputRef,
  onTranscript,
  questionContext,
  className,
  size = 'sm',
  variant = 'ghost',
  projectId,
  disabled = false,
  showDuration = true,
}: VoiceInputFieldButtonProps) {
  const { getRemainingTime, consumeTime } = useVoiceQuota();
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const wasRecordingRef = useRef(false);
  const timeUsedRef = useRef(0);

  // Get remaining time for this specific field
  const remainingTimeForField = getRemainingTime(fieldId);

  // If no time remaining, hide the button
  if (remainingTimeForField <= 0) {
    return null;
  }

  const speechToTextOptions: UseSpeechToTextOptions = {
    onTranscriptionComplete: (text) => {
      // Append to existing text
      if (inputRef?.current) {
        const currentValue = inputRef.current.value;
        const newValue = currentValue
          ? `${currentValue} ${text}`.trim()
          : text;

        // Update input value directly
        inputRef.current.value = newValue;

        // Trigger React's onChange event so parent component gets updated
        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);
      }

      // Don't call onTranscript - the input event above will trigger onChange in parent
      // This prevents double-updating and ensures append behavior works correctly
    },
    maxDurationSeconds: remainingTimeForField,
    projectId,
    questionContext,
  };

  const {
    recordingState,
    isRecording,
    isProcessing,
    remainingTime,
    timeUsed,
    startRecording,
    stopRecording,
  } = useSpeechToText(speechToTextOptions);

  // Track timeUsed in ref
  useEffect(() => {
    timeUsedRef.current = timeUsed;
  }, [timeUsed]);

  // Detect when recording stops (either manually or automatically when reaching 0)
  useEffect(() => {
    if (wasRecordingRef.current && !isRecording && !isProcessing) {
      // Recording just stopped - update quota
      const actualTimeUsed = timeUsedRef.current;
      if (actualTimeUsed > 0) {
        consumeTime(fieldId, actualTimeUsed);
      }
      wasRecordingRef.current = false;
      setRecordingStartTime(null);
    } else if (isRecording) {
      wasRecordingRef.current = true;
    }
  }, [isRecording, isProcessing, fieldId, consumeTime]);

  const handleClick = async () => {
    if (isRecording) {
      // Just stop recording - the useEffect above will handle quota update
      await stopRecording();
    } else if (!isProcessing) {
      setRecordingStartTime(Date.now());
      await startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTooltipText = () => {
    if (disabled) return 'Enregistrement vocal désactivé';
    if (isProcessing) return 'Transcription en cours...';
    if (isRecording) return 'Arrêter l\'enregistrement';
    return `Enregistrer un message vocal (${remainingTimeForField}s restantes)`;
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showDuration && size !== 'icon' && (
            <span className="ml-2 text-xs">Transcription...</span>
          )}
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4 fill-current" />
          {showDuration && size !== 'icon' && (
            <span className="ml-2 text-xs font-mono">{formatDuration(remainingTime)}</span>
          )}
        </>
      );
    }

    return <Mic className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size={size}
            variant={variant}
            onClick={handleClick}
            disabled={disabled || isProcessing}
            className={cn(
              'relative transition-all',
              isRecording && 'animate-pulse text-red-500 hover:text-red-600',
              isProcessing && 'cursor-wait',
              className
            )}
            aria-label={getTooltipText()}
          >
            {getButtonContent()}

            {/* Recording indicator dot */}
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
          {isRecording && showDuration && (
            <p className="text-xs text-muted-foreground mt-1">
              Décompte: {formatDuration(remainingTime)}s
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
