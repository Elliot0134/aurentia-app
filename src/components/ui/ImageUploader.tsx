import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  bucket: string;
  value?: string; // Current image URL
  folder?: string;
  maxSizeMB?: number;
  onUpload?: (publicUrl: string) => void;
  onDelete?: () => void;
  mode?: 'logo' | 'banner'; // logo = circle, banner = rectangle
  disabled?: boolean; // Disable when not in edit mode
  fallbackText?: string; // Fallback text for logo mode
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  value,
  folder = '',
  maxSizeMB = 5,
  onUpload,
  onDelete,
  mode = 'logo',
  disabled = false,
  fallbackText = 'O'
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validateAndUploadFile = async (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Le fichier doit être une image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: 'Erreur',
        description: `La taille du fichier ne doit pas dépasser ${maxSizeMB} MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload to Supabase storage
    setUploading(true);
    setProgress(0);

    try {
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/\s+/g, '_')}`;
      const path = folder ? `${folder}/${uniqueName}` : uniqueName;

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { 
          upsert: false,
          contentType: file.type 
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl || '';
      
      setProgress(100);
      setPreview(publicUrl);

      if (onUpload) {
        onUpload(publicUrl);
      }

      toast({
        title: 'Upload terminé',
        description: 'Image chargée avec succès.',
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: 'Erreur upload',
        description: err?.message || "Erreur lors de l'upload",
        variant: 'destructive',
      });
      // Revert preview on error
      setPreview(value || null);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 400);
      // Revoke object URL
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await validateAndUploadFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    setIsDragging(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndUploadFile(file);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    
    const confirmed = window.confirm('Supprimer cette image ?');
    if (!confirmed) return;

    setPreview(null);
    
    if (onDelete) {
      onDelete();
    }

    toast({
      title: 'Image supprimée',
      description: 'La référence de l\'image a été supprimée.',
    });
  };

  // Logo mode - circle shape
  if (mode === 'logo') {
    return (
      <div className="space-y-2">
        <div 
          className="relative group"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className={cn(
              "w-32 h-32 rounded-full overflow-hidden border-4 relative transition-all",
              !disabled && "cursor-pointer",
              isDragging ? "border-aurentia-pink scale-105" : "border-gray-200"
            )}>
              <img 
                src={preview} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <>
                  <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <Upload className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading || disabled}
                      className="hidden"
                    />
                  </label>
                  {!uploading && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  {progress !== null && (
                    <div className="w-3/4 bg-gray-300 rounded-full h-2">
                      <div 
                        className="bg-aurentia-pink h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <label className={cn(
              "w-32 h-32 rounded-full border-4 border-dashed flex flex-col items-center justify-center bg-gradient-to-br from-aurentia-pink to-aurentia-orange text-white text-4xl font-bold transition-all",
              !disabled && "cursor-pointer hover:border-aurentia-pink",
              isDragging ? "border-aurentia-pink scale-105 border-solid" : "border-gray-300"
            )}>
              {disabled ? (
                <span>{fallbackText.charAt(0).toUpperCase()}</span>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center px-2">
                    {isDragging ? 'Déposer ici' : 'Cliquer ou glisser'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading || disabled}
                    className="hidden"
                  />
                </>
              )}
            </label>
          )}
        </div>
        {!disabled && (
          <p className="text-xs text-gray-500 text-center">
            Max {maxSizeMB} MB • JPG, PNG, GIF
          </p>
        )}
      </div>
    );
  }

  // Banner mode - rectangle shape
  return (
    <div className="space-y-2">
      <div 
        className="relative group"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className={cn(
            "w-full h-48 rounded-lg overflow-hidden border-2 relative transition-all",
            !disabled && "cursor-pointer",
            isDragging ? "border-aurentia-pink scale-[1.02]" : "border-gray-200"
          )}>
            <img 
              src={preview} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <>
                <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Upload className="w-12 h-12 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading || disabled}
                    className="hidden"
                  />
                </label>
                {!uploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                {progress !== null && (
                  <div className="w-3/4 bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-aurentia-pink h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <label className={cn(
            "w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all",
            !disabled && "cursor-pointer hover:border-aurentia-pink hover:bg-gray-100",
            isDragging ? "border-aurentia-pink bg-aurentia-pink/5 border-solid scale-[1.02]" : "border-gray-300 bg-gray-50"
          )}>
            {disabled ? (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Aucune bannière</span>
              </>
            ) : (
              <>
                <Upload className={cn(
                  "w-12 h-12 mb-2 transition-colors",
                  isDragging ? "text-aurentia-pink" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isDragging ? "text-aurentia-pink" : "text-gray-600"
                )}>
                  {isDragging ? 'Déposer l\'image ici' : 'Cliquer pour ajouter une bannière'}
                </span>
                <span className="text-xs text-gray-500 mt-1">ou glisser-déposer une image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading || disabled}
                  className="hidden"
                />
              </>
            )}
          </label>
        )}
      </div>
      {!disabled && (
        <p className="text-xs text-gray-500 text-center">
          Formats acceptés: JPG, PNG, GIF (max {maxSizeMB} MB)
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
