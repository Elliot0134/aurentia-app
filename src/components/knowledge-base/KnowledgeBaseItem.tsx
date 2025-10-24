import React from 'react';
import { FileText, Type, Globe, Trash2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/services/knowledgeBaseService';
import { cn } from '@/lib/utils';
import type { KnowledgeBaseContentType } from '@/types/knowledgeBaseTypes';

interface KnowledgeBaseItemProps {
  id: string;
  title: string;
  contentType: KnowledgeBaseContentType;
  fileSize?: number;
  tags: string[];
  createdAt: string;
  onView: () => void;
  onDelete: () => void;
}

const KnowledgeBaseItem: React.FC<KnowledgeBaseItemProps> = ({
  title,
  contentType,
  fileSize,
  tags,
  createdAt,
  onView,
  onDelete,
}) => {
  // Get icon based on content type
  const getIcon = () => {
    switch (contentType) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'text':
        return <Type className="w-5 h-5" />;
      case 'url':
        return <Globe className="w-5 h-5" />;
    }
  };

  // Get color based on content type
  const getColor = () => {
    switch (contentType) {
      case 'document':
        return 'text-blue-500 bg-blue-50';
      case 'text':
        return 'text-purple-500 bg-purple-50';
      case 'url':
        return 'text-green-500 bg-green-50';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="group bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-aurentia-pink/50 hover:-translate-y-0.5 cursor-pointer"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      aria-label={`Voir le document ${title}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow', getColor())}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1.5 group-hover:text-aurentia-pink transition-colors">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(createdAt)}</span>
            </div>
            {fileSize !== undefined && fileSize > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span className="font-medium">{formatBytes(fileSize)}</span>
              </>
            )}
            <span className="text-gray-300">•</span>
            <span className="capitalize font-medium">{contentType === 'url' ? 'URL' : contentType}</span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 hover:from-aurentia-pink/10 hover:to-aurentia-orange/10 hover:text-aurentia-pink border border-gray-200 transition-all"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-aurentia-pink/10 hover:text-aurentia-pink"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            aria-label="Voir le document"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Supprimer le document"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseItem;
