import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrganisationImageUploaderProps {
  bucket: string;
  value?: string; // Current image URL
  folder?: string;
  label?: string;
  maxSizeMB?: number;
  onUpload?: (publicUrl: string) => void;
  onDelete?: () => void;
  aspectRatio?: 'square' | 'wide'; // square for logos, wide for banners
}

const OrganisationImageUploader: React.FC<OrganisationImageUploaderProps> = ({
  bucket,
  value,
  folder = '',
  label,
  maxSizeMB = 5,
  onUpload,
  onDelete,
  aspectRatio = 'square'
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image.');
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
      setError(`Taille maximale ${maxSizeMB} MB`);
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
      setError(err?.message || "Erreur lors de l'upload");
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

  const handleRemove = () => {
    const confirmed = window.confirm('Supprimer cette image ?');
    if (!confirmed) return;

    setPreview(null);
    setError(null);
    
    if (onDelete) {
      onDelete();
    }

    toast({
      title: 'Image supprimée',
      description: 'La référence de l\'image a été supprimée.',
    });
  };

  const containerClasses = aspectRatio === 'square' 
    ? 'w-32 h-32' 
    : 'w-full h-32';

  const dropAreaClasses = aspectRatio === 'square'
    ? 'aspect-square'
    : 'aspect-[3/1]';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Preview or drop area */}
        <div className={`${containerClasses} relative group rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-aurentia-pink transition-colors bg-gray-50`}>
          {preview ? (
            <>
              <img 
                src={preview} 
                alt={label || 'Preview'} 
                className="w-full h-full object-cover"
              />
              {!uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              )}
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-xs text-gray-500 text-center px-2">
                Cliquer pour sélectionner
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}

          {/* Upload progress overlay */}
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

        {/* Change button when image exists */}
        {preview && !uploading && (
          <label className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
              <Upload className="w-4 h-4" />
              Changer l'image
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {/* Info text */}
        <p className="text-xs text-gray-500">
          Formats acceptés: JPG, PNG, GIF (max {maxSizeMB} MB)
        </p>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OrganisationImageUploader;
