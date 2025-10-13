import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  Upload, 
  X, 
  Loader2, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  bucket: string;
  folder?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[]; // e.g., ['image/*', 'application/pdf', '.doc', '.docx']
  multiple?: boolean;
  disabled?: boolean;
  onUpload?: (files: UploadedFile[]) => void;
  onDelete?: (fileId: string) => void;
  existingFiles?: UploadedFile[];
  showPreview?: boolean;
  compact?: boolean; // Compact mode for smaller UI
}

const FileUploader: React.FC<FileUploaderProps> = ({
  bucket,
  folder = '',
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedFileTypes = ['*/*'], // Accept all by default
  multiple = true,
  disabled = false,
  onUpload,
  onDelete,
  existingFiles = [],
  showPreview = true,
  compact = false
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FileArchive className="w-5 h-5" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileText className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `Le fichier dépasse la taille maximale de ${maxSizeMB} MB`
      };
    }

    // Check file type
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes('*/*')) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isAccepted = acceptedFileTypes.some(accepted => {
        if (accepted.startsWith('.')) {
          return fileName.endsWith(accepted.toLowerCase());
        }
        if (accepted.endsWith('/*')) {
          const category = accepted.split('/')[0];
          return fileType.startsWith(category + '/');
        }
        return fileType === accepted;
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: 'Type de fichier non accepté'
        };
      }
    }

    // Check max files limit
    if (files.length >= maxFiles) {
      return {
        valid: false,
        error: `Nombre maximum de fichiers atteint (${maxFiles})`
      };
    }

    return { valid: true };
  };

  // Upload file to Supabase
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Create initial file object
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0
    };

    // Add to files list
    setFiles(prev => [...prev, uploadedFile]);

    try {
      const uniqueName = `${fileId}_${file.name.replace(/\s+/g, '_')}`;
      const path = folder ? `${folder}/${uniqueName}` : uniqueName;

      // Upload to Supabase with progress tracking (simulated)
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl || '';

      // Update file status
      const successFile: UploadedFile = {
        ...uploadedFile,
        url: publicUrl,
        status: 'success',
        progress: 100
      };

      setFiles(prev =>
        prev.map(f => (f.id === fileId ? successFile : f))
      );

      return successFile;
    } catch (error: any) {
      const errorFile: UploadedFile = {
        ...uploadedFile,
        status: 'error',
        progress: 0,
        error: error.message || 'Erreur lors de l\'upload'
      };

      setFiles(prev =>
        prev.map(f => (f.id === fileId ? errorFile : f))
      );

      throw error;
    }
  };

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      toast({
        title: 'Erreurs de validation',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    // Upload valid files
    if (validFiles.length > 0) {
      try {
        const uploadPromises = validFiles.map(file => uploadFile(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        
        if (onUpload) {
          onUpload(uploadedFiles);
        }

        toast({
          title: 'Upload terminé',
          description: `${validFiles.length} fichier(s) chargé(s) avec succès.`,
        });
      } catch (error) {
        toast({
          title: 'Erreur d\'upload',
          description: 'Certains fichiers n\'ont pas pu être uploadés.',
          variant: 'destructive',
        });
      }
    }
  }, [files, maxFiles, maxSizeMB, acceptedFileTypes, onUpload]);

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // Delete file handler
  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (onDelete) {
      onDelete(fileId);
    }
    toast({
      title: 'Fichier supprimé',
      description: 'Le fichier a été retiré de la liste.',
    });
  };

  // Retry upload
  const handleRetry = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Remove error file
    setFiles(prev => prev.filter(f => f.id !== fileId));

    // Create a new File object (we can't store it in state)
    // This is a limitation - in production, you'd want to keep the File reference
    toast({
      title: 'Réessayer',
      description: 'Veuillez sélectionner à nouveau le fichier.',
    });
  };

  // Open file picker
  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Calculate accept string for input
  const acceptString = acceptedFileTypes.join(',');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all",
          compact ? "p-4" : "p-8",
          isDragging ? "border-aurentia-pink bg-aurentia-pink/5 scale-[1.01]" : "border-gray-300 bg-gray-50",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-aurentia-pink hover:bg-gray-100"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptString}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={cn(
            "mb-4 transition-colors",
            compact ? "w-8 h-8" : "w-12 h-12",
            isDragging ? "text-aurentia-pink" : "text-gray-400"
          )} />
          
          <h3 className={cn(
            "font-semibold mb-2 transition-colors",
            compact ? "text-sm" : "text-lg",
            isDragging ? "text-aurentia-pink" : "text-gray-700"
          )}>
            {isDragging ? 'Déposer les fichiers ici' : 'Glisser-déposer vos fichiers'}
          </h3>
          
          <p className={cn(
            "text-gray-500 mb-4",
            compact ? "text-xs" : "text-sm"
          )}>
            ou cliquez pour parcourir
          </p>

          {!compact && (
            <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
              <span>Max {maxFiles} fichiers</span>
              <span>•</span>
              <span>Jusqu'à {maxSizeMB} MB par fichier</span>
              {acceptedFileTypes.length > 0 && !acceptedFileTypes.includes('*/*') && (
                <>
                  <span>•</span>
                  <span>{acceptedFileTypes.join(', ')}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Fichiers ({files.length}/{maxFiles})
          </h4>
          
          <div className={cn(
            "space-y-2",
            compact ? "max-h-48 overflow-y-auto" : "max-h-96 overflow-y-auto"
          )}>
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  file.status === 'success' && "bg-green-50 border-green-200",
                  file.status === 'error' && "bg-red-50 border-red-200",
                  file.status === 'uploading' && "bg-blue-50 border-blue-200"
                )}
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                  {file.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {file.status !== 'uploading' && file.status !== 'success' && file.status !== 'error' && getFileIcon(file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.status === 'uploading' && (
                      <>
                        <span>•</span>
                        <span>{file.progress}%</span>
                      </>
                    )}
                    {file.status === 'error' && file.error && (
                      <>
                        <span>•</span>
                        <span className="text-red-500">{file.error}</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {file.status === 'success' && showPreview && file.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, '_blank');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {file.status === 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(file.id);
                      }}
                    >
                      Réessayer
                    </Button>
                  )}
                  
                  {!disabled && file.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
