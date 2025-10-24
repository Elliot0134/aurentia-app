import React from 'react';
import KnowledgeBaseItem from './KnowledgeBaseItem';
import KnowledgeBaseEmpty from './KnowledgeBaseEmpty';
import type { ProjectKnowledgeBaseItem, OrganizationKnowledgeBaseItem } from '@/types/knowledgeBaseTypes';

interface KnowledgeBaseListProps {
  items: (ProjectKnowledgeBaseItem | OrganizationKnowledgeBaseItem)[];
  onViewItem: (item: ProjectKnowledgeBaseItem | OrganizationKnowledgeBaseItem) => void;
  onDeleteItem: (item: ProjectKnowledgeBaseItem | OrganizationKnowledgeBaseItem) => void;
  isLoading?: boolean;
}

const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({
  items,
  onViewItem,
  onDeleteItem,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 animate-pulse"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20" />
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <KnowledgeBaseEmpty />;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
        >
          <KnowledgeBaseItem
            id={item.id}
            title={item.title}
            contentType={item.content_type}
            fileSize={item.file_size}
            tags={item.tags}
            createdAt={item.created_at}
            onView={() => onViewItem(item)}
            onDelete={() => onDeleteItem(item)}
          />
        </div>
      ))}
    </div>
  );
};

export default KnowledgeBaseList;
