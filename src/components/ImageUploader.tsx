import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type ImageUploaderProps = {
  bucket: string;
  value?: string; // existing public URL
  folder?: string; // optional folder inside bucket
  existingPath?: string; // optional existing storage path to allow deletion
  useSignedUrl?: boolean; // if true, attempt to create signed URL for downloads
  signedUrlExpirySec?: number;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onUpload?: (publicUrl: string, path: string) => void;
  onDelete?: (removedPath?: string) => void;
};

const defaultAccept = 'image/*';

const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  value,
  folder = '',
  existingPath,
  useSignedUrl,
  signedUrlExpirySec,
  label,
  accept = defaultAccept,
  maxSizeMB = 5,
  onUpload,
  onDelete
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [filesize, setFilesize] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFile = async (file: File, opts?: { useSignedUrl?: boolean, signedUrlExpirySec?: number }) => {
    setError(null);

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image.');
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Taille maximale ${maxSizeMB} MB`);
      return;
    }

  setUploading(true);
    setProgress(0);

    try {
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/\s+/g, '_')}`;
      const path = folder ? `${folder}/${uniqueName}` : uniqueName;

      // upload
      const { data, error: uploadError } = await supabase.storage
        .from(bucket as any)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // get public URL or signed URL
      let publicUrl = '';
  const useSigned = opts?.useSignedUrl || useSignedUrl || false;
      if (useSigned) {
        const expiry = opts?.signedUrlExpirySec || 60 * 60; // default 1h
        const { data: signedData, error: signedError } = await supabase.storage.from(bucket as any).createSignedUrl(path, expiry as number);
        if (!signedError && (signedData as any)?.signedUrl) {
          publicUrl = (signedData as any).signedUrl;
        } else {
          // fallback to public url
          const { data: urlData } = supabase.storage.from(bucket as any).getPublicUrl(path);
          publicUrl = (urlData as any)?.publicUrl || '';
        }
      } else {
        const { data: urlData } = supabase.storage.from(bucket as any).getPublicUrl(path);
        publicUrl = (urlData as any)?.publicUrl || '';
      }

  setPreview(publicUrl || null);
  setUploadedPath(path);
      setProgress(100);

      if (onUpload) onUpload(publicUrl, path);
      toast({ title: 'Upload terminé', description: 'Image chargée avec succès.' });
    } catch (err: any) {
      console.error('Upload error', err);
      setError(err?.message || 'Erreur lors de l\'upload');
      toast({ title: 'Erreur upload', description: err?.message || 'Erreur lors de l\'upload', variant: 'destructive' });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 400);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // show local preview immediately and remember objectUrl to revoke later
      const objectUrl = URL.createObjectURL(file);
      // revoke previous
      if (localObjectUrl) {
        try { URL.revokeObjectURL(localObjectUrl); } catch {}
      }
      setLocalObjectUrl(objectUrl);
      setPreview(objectUrl);
      setFilename(file.name);
      setFilesize(file.size);
      handleFile(file, { useSignedUrl: useSignedUrl, signedUrlExpirySec: signedUrlExpirySec }).catch(() => {});
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      if (localObjectUrl) {
        try { URL.revokeObjectURL(localObjectUrl); } catch {}
      }
      setLocalObjectUrl(objectUrl);
      setPreview(objectUrl);
      setFilename(file.name);
      setFilesize(file.size);
      handleFile(file).catch(() => {});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = async () => {
    // Confirm removal
    const confirmed = window.confirm('Supprimer cette image ? Cela supprimera la référence dans votre profil.');
    if (!confirmed) return;

    setError(null);

    // Decide which path to delete: newly uploaded path (uploadedPath) or provided existingPath prop
  const pathToDelete = uploadedPath || existingPath || null;

    // If we don't have a path, warn user that only the reference will be removed
    if (!pathToDelete) {
      // just remove preview and call callback
      if (localObjectUrl) {
        try { URL.revokeObjectURL(localObjectUrl); } catch {}
        setLocalObjectUrl(null);
      }
      setPreview(null);
      setFilename(null);
      setFilesize(null);
      if (onDelete) onDelete(undefined);
      return;
    }

    // Soft-delete: remove reference immediately and schedule physical deletion in background
    setDeleting(true);
    // Clear UI first
    if (localObjectUrl) {
      try { URL.revokeObjectURL(localObjectUrl); } catch {}
      setLocalObjectUrl(null);
    }
    setPreview(null);
    setFilename(null);
    setFilesize(null);
    setUploadedPath(null);
    if (onDelete) onDelete(pathToDelete || undefined);

    if (!pathToDelete) {
      setDeleting(false);
      toast({ title: 'Référence supprimée', description: 'La référence a été supprimée.' });
      return;
    }

    const tryRemove = async (path: string) => {
      try {
        const { error: removeError } = await supabase.storage.from(bucket as any).remove([path]);
        if (removeError) throw removeError;
        toast({ title: 'Fichier supprimé', description: 'Le fichier a été supprimé du storage.' });
        return true;
      } catch (err: any) {
        console.error('Remove error', err);
  toast({ title: 'Suppression en attente', description: 'La suppression physique a échoué et sera réessayée en background.' });
        return false;
      }
    };

    const success = await tryRemove(pathToDelete);
    if (!success) {
      // persist retry info in localStorage
      try {
        const key = 'pending_storage_deletes';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) as string[] : [];
        if (!arr.includes(pathToDelete)) {
          arr.push(pathToDelete);
          localStorage.setItem(key, JSON.stringify(arr));
        }
      } catch (e) {
        console.error('Could not persist pending delete', e);
      }
    }

    setDeleting(false);
  };

  // Background retry: attempt to delete pending items on mount
  useEffect(() => {
    const key = 'pending_storage_deletes';
    const runPending = async () => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const arr = JSON.parse(raw) as string[];
        if (!arr || !arr.length) return;
        const remaining: string[] = [];
        for (const p of arr) {
          try {
            const { error } = await supabase.storage.from(bucket as any).remove([p]);
            if (error) {
              console.error('Retry delete failed for', p, error);
              remaining.push(p);
            }
          } catch (e) {
            console.error('Retry delete exception for', p, e);
            remaining.push(p);
          }
        }
        if (remaining.length) localStorage.setItem(key, JSON.stringify(remaining));
        else localStorage.removeItem(key);
      } catch (e) {
        console.error('Error processing pending deletes', e);
      }
    };

    // run in background
    setTimeout(() => { runPending().catch(() => {}); }, 500);
  }, [bucket]);

  // Revoke any created object URL on unmount
  useEffect(() => {
    return () => {
      if (localObjectUrl) {
        try { URL.revokeObjectURL(localObjectUrl); } catch {}
      }
    };
  }, [localObjectUrl]);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex items-center gap-4 p-3 border border-dashed rounded-md bg-white"
      >
        <div className="w-28 h-28 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="object-contain w-full h-full" />
          ) : (
            <div className="text-xs text-gray-400">Aperçu</div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 ${uploading || deleting ? 'opacity-50 pointer-events-none' : 'bg-aurentia-pink text-white'} rounded-md text-sm`}>
              Choisir un fichier
              <input
                type="file"
                accept={accept}
                onChange={onChange}
                className="hidden"
                disabled={uploading || deleting}
              />
            </label>

            {preview && (
              <button type="button" onClick={handleRemove} disabled={uploading || deleting} className={`text-sm text-gray-600 underline ${uploading || deleting ? 'opacity-50 pointer-events-none' : ''}`}>
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">Glisser-déposer une image ou cliquez pour sélectionner. Max {maxSizeMB} MB.</p>

          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div className="bg-aurentia-pink h-2 rounded-full" style={{ width: `${progress ?? 40}%` }} />
            </div>
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
