import React, { useState, useEffect } from 'react';
import { Video as VideoIcon, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { detectVideoEmbed, getVideoPlatformName } from '@/utils/videoEmbedUtils';
import { supabase } from '@/integrations/supabase/client';
import type { VideoBlock as VideoBlockType } from '@/types/resourceTypes';

interface VideoBlockProps {
  block: VideoBlockType;
  isActive: boolean;
  onUpdate: (data: Partial<VideoBlockType['data']>) => void;
  onActivate: () => void;
  readOnly?: boolean;
  organizationId?: string;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onActivate,
  readOnly = false,
  organizationId
}) => {
  const [inputUrl, setInputUrl] = useState(block.data.url || '');
  const [error, setError] = useState<string | null>(null);
  const [isValidVideo, setIsValidVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Validate on mount if URL exists
    if (block.data.url) {
      const embed = detectVideoEmbed(block.data.url);
      setIsValidVideo(!!embed);
    }
  }, [block.data.url]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    setError(null);
  };

  const handleUrlBlur = () => {
    if (!inputUrl.trim()) {
      setError(null);
      setIsValidVideo(false);
      return;
    }

    const embedInfo = detectVideoEmbed(inputUrl);

    if (embedInfo) {
      // Valid video URL
      onUpdate({
        url: inputUrl,
        platform: embedInfo.platform,
        embedId: embedInfo.embedId
      });
      setError(null);
      setIsValidVideo(true);
    } else {
      // Invalid URL
      setError('URL vidéo non valide. Supports: YouTube, Vimeo, Dailymotion');
      setIsValidVideo(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value });
  };

  const validateAndUploadFile = async (file: File) => {
    if (!organizationId) {
      setError('ID d\'organisation manquant');
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez MP4, WebM, OGG, MOV, AVI, ou MKV.');
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 20 MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${organizationId}/${block.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('organization-resources-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('organization-resources-videos')
        .getPublicUrl(filePath);

      onUpdate({
        uploadType: 'upload',
        fileUrl: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        url: '', // Clear embed URL
        embedId: '',
        platform: 'other'
      });

      setIsValidVideo(true);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await validateAndUploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await validateAndUploadFile(file);
    }
  };

  const handleDeleteUpload = async () => {
    if (!block.data.fileUrl || !organizationId) return;

    try {
      const pathParts = block.data.fileUrl.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(organizationId)).join('/');

      await supabase.storage
        .from('organization-resources-videos')
        .remove([filePath]);

      onUpdate({
        uploadType: 'embed',
        fileUrl: undefined,
        filename: undefined,
        size: undefined
      });
      setIsValidVideo(false);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Render video embed
  const renderVideoEmbed = () => {
    const embedInfo = detectVideoEmbed(block.data.url);
    if (!embedInfo) return null;

    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={embedInfo.embedUrl}
          title={block.data.title || 'Video'}
          className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  if (readOnly) {
    const uploadType = block.data.uploadType || 'embed';

    return (
      <div className="space-y-2">
        {uploadType === 'upload' && block.data.fileUrl ? (
          <video
            src={block.data.fileUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '500px' }}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : block.data.url ? (
          renderVideoEmbed()
        ) : null}
        {block.data.title && (
          <p className="text-sm text-gray-600 font-medium text-center">
            {block.data.title}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 rounded-lg p-4 transition-all",
        isActive ? "" : "border-transparent hover:border-gray-200"
      )}
      style={isActive ? {
        borderColor: 'var(--color-primary, #ff5932)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
      } : undefined}
      onClick={onActivate}
      data-tour="video-block"
    >
      {/* Block Type Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <VideoIcon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Vidéo</span>
        {isValidVideo && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {getVideoPlatformName(block.data.platform)}
          </span>
        )}
      </div>

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Upload Type Selector */}
        <div className="space-y-2">
          <Label className="text-xs">Type de vidéo</Label>
          <Select
            value={block.data.uploadType || 'embed'}
            onValueChange={(value: any) => onUpdate({ uploadType: value })}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="embed">Lien vidéo (YouTube, Vimeo, etc.)</SelectItem>
              <SelectItem value="upload">Uploader un fichier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {block.data.uploadType === 'upload' ? (
          /* File Upload Mode */
          <div className="space-y-2">
            {block.data.fileUrl ? (
              /* Show uploaded video */
              <div className="space-y-2">
                <video
                  src={block.data.fileUrl}
                  controls
                  className="w-full rounded-lg border"
                  style={{ maxHeight: '300px' }}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{block.data.filename}</p>
                    <p className="text-xs text-gray-500">
                      {block.data.size ? `${(block.data.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteUpload}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Upload button with drag and drop */
              <div>
                <Label htmlFor={`video-file-${block.id}`} className="text-xs mb-2 block">
                  Fichier vidéo *
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-all",
                    isDragging
                      ? "border-opacity-100 bg-gray-50 scale-[1.02]"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  style={isDragging ? {
                    borderColor: 'var(--color-primary, #ff5932)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 5%, white)'
                  } : undefined}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    id={`video-file-${block.id}`}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor={`video-file-${block.id}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className={cn(
                      "w-8 h-8 transition-colors",
                      isDragging ? "scale-110" : ""
                    )}
                    style={isDragging ? {
                      color: 'var(--color-primary, #ff5932)'
                    } : { color: '#9ca3af' }}
                    />
                    <span className="text-sm font-medium">
                      {uploading ? 'Upload en cours...' : isDragging ? 'Déposez la vidéo ici' : 'Glissez une vidéo ou cliquez pour uploader'}
                    </span>
                    <span className="text-xs text-gray-500">
                      MP4, WebM, OGG, MOV, AVI, MKV (max 20 MB)
                    </span>
                  </label>
                  {uploading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${uploadProgress}%`,
                            backgroundColor: 'var(--color-primary, #ff5932)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Embed URL Mode */
          <div className="space-y-2">
            <Label htmlFor={`video-url-${block.id}`} className="text-xs">
              URL de la vidéo *
            </Label>
            <Input
              id={`video-url-${block.id}`}
              value={inputUrl}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              placeholder="https://www.youtube.com/watch?v=..."
              className={cn(
                "text-sm",
                error && "border-red-500 focus:border-red-500"
              )}
            />
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Supports: YouTube, Vimeo, Dailymotion
            </p>
          </div>
        )}

        {/* Video Preview */}
        {isValidVideo && block.data.url && (
          <>
            <div className="bg-gray-100 rounded-lg p-2">
              {renderVideoEmbed()}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor={`video-title-${block.id}`} className="text-xs">
                Titre (optionnel)
              </Label>
              <Input
                id={`video-title-${block.id}`}
                value={block.data.title || ''}
                onChange={handleTitleChange}
                placeholder="Titre de la vidéo..."
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoBlock;
