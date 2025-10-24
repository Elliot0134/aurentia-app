import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ResourceTagEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  organizationId?: string;
  readOnly?: boolean;
}

// Tags prédéfinis courants (peuvent être étendus selon les besoins)
const PREDEFINED_TAGS = [
  'onboarding',
  'guide',
  'tutorial',
  'référence',
  'documentation',
  'faq',
  'processus',
  'formation',
  'important',
  'débutant',
  'avancé',
  'administratif',
  'technique',
];

export function ResourceTagEditor({
  tags,
  onTagsChange,
  organizationId,
  readOnly = false,
}: ResourceTagEditorProps) {
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (newTag.trim() === '') {
      setSuggestions(PREDEFINED_TAGS.filter(tag => !tags.includes(tag)));
    } else {
      const filtered = PREDEFINED_TAGS.filter(
        tag =>
          tag.toLowerCase().includes(newTag.toLowerCase()) &&
          !tags.includes(tag)
      );
      setSuggestions(filtered);
    }
  }, [newTag, tags]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setNewTag('');
      setIsPopoverOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    } else if (e.key === 'Escape') {
      setNewTag('');
      setIsPopoverOpen(false);
    }
  };

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <span className="text-sm text-gray-400">Aucun tag</span>
        ) : (
          tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tags existants */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs group hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:bg-red-100 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-gray-400">Aucun tag - Ajoutez-en pour organiser votre ressource</span>
        )}
      </div>

      {/* Ajouter un tag */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Ajouter un tag</h4>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nom du tag..."
                  className="text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleAddTag(newTag)}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-2">Suggestions</h5>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAddTag(suggestion)}
                      className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags courants */}
            <div>
              <h5 className="text-xs font-medium text-gray-500 mb-2">Tags courants</h5>
              <div className="flex flex-wrap gap-1">
                {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ResourceTagEditor;
