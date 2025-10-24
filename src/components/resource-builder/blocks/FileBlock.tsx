import React from 'react';
import { File as FileIcon, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploader from '@/components/ui/FileUploader';
import { cn } from '@/lib/utils';
import type { FileBlock as FileBlockType } from '@/types/resourceTypes';

interface FileBlockProps {
  block: FileBlockType;
  isActive: boolean;
  onUpdate: (data: Partial<FileBlockType['data']>) => void;
  onActivate: () => void;
  readOnly?: boolean;
  organizationId?: string;
}

export const FileBlock: React.FC<FileBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onActivate,
  readOnly = false,
  organizationId
}) => {
  const handleFileUpload = (files: any[]) => {
    if (files.length > 0) {
      const file = files[0];
      onUpdate({
        url: file.url,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const type = block.data.mimeType?.toLowerCase() || '';
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileText className="w-8 h-8 text-green-500" />;
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  if (readOnly) {
    if (!block.data.url) return null;

    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">
            {block.data.filename}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(block.data.size)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(block.data.url, '_blank')}
          className="flex-shrink-0"
        >
          <Download className="w-4 h-4 mr-1" />
          Télécharger
        </Button>
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
    >
      {/* Block Type Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <FileIcon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Fichier joint</span>
      </div>

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Show existing file */}
        {block.data.url && (
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {block.data.filename}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(block.data.size)}
                {block.data.uploadedAt && (
                  <span className="ml-2">
                    • Uploadé le {new Date(block.data.uploadedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(block.data.url, '_blank')}
              className="flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
          </div>
        )}

        {/* File uploader */}
        {!block.data.url && (
          <FileUploader
            bucket="organization-resources"
            folder={organizationId ? `${organizationId}/files` : 'files'}
            maxFiles={1}
            maxSizeMB={50}
            onUpload={handleFileUpload}
            multiple={false}
            compact={true}
          />
        )}

        {/* Replace file option */}
        {block.data.url && isActive && (
          <div className="pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ url: '', filename: '', size: 0, mimeType: '' })}
              className="w-full"
            >
              Remplacer le fichier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBlock;
