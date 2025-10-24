import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import FileUploader from '@/components/ui/FileUploader';
import type { DocumentContentData } from '@/types/knowledgeBaseTypes';
import { formatBytes } from '@/services/knowledgeBaseService';

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

interface AddFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, contentData: DocumentContentData, tags: string[], fileSize: number, fileUrl: string) => Promise<void>;
  bucket: 'knowledge-base-files' | 'org-knowledge-base-files';
  folderPath: string;
  maxFileSizeMB?: number;
  canUpload: (fileSize: number) => { canUpload: boolean; reason?: string };
  remainingStorage: number;
}

const AddFilesModal: React.FC<AddFilesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bucket,
  folderPath,
  maxFileSizeMB = 50,
  canUpload,
  remainingStorage,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez charger au moins un fichier.',
        variant: 'destructive',
      });
      return;
    }

    const successfulFiles = uploadedFiles.filter((f) => f.status === 'success');

    if (successfulFiles.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucun fichier n\'a été chargé avec succès.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Process each successfully uploaded file
      for (const file of successfulFiles) {
        const contentData: DocumentContentData = {
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: file.url,
        };

        const tagsArray = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        await onSubmit(file.name, contentData, tagsArray, file.size, file.url);
      }

      // Reset form
      setUploadedFiles([]);
      setTags('');
      onClose();
    } catch (error) {
      console.error('Error adding files:', error);
      // Error toast is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUploadedFiles([]);
      setTags('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aurentia-pink/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-aurentia-pink" />
            </div>
            <div>
              <DialogTitle>Ajouter des fichiers</DialogTitle>
              <DialogDescription>
                Chargez des documents dans votre base de connaissance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Storage info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Espace disponible: <span className="font-medium text-gray-900">{formatBytes(remainingStorage)}</span>
            </p>
          </div>

          {/* File uploader */}
          <FileUploader
            bucket={bucket}
            folder={folderPath}
            maxFiles={5}
            maxSizeMB={maxFileSizeMB}
            multiple={true}
            onUpload={handleFileUpload}
            acceptedFileTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'text/plain',
              'text/csv',
              'image/*',
            ]}
            showPreview={true}
          />

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optionnel)</Label>
            <Input
              id="tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Ces tags seront appliqués à tous les fichiers chargés
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || uploadedFiles.length === 0}
            className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange hover:shadow-lg"
          >
            {isLoading ? 'Ajout en cours...' : `Ajouter ${uploadedFiles.length} fichier(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFilesModal;
