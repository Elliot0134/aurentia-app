import React, { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import type { UrlContentData } from '@/types/knowledgeBaseTypes';

interface AddUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, contentData: UrlContentData, tags: string[]) => Promise<void>;
}

const AddUrlModal: React.FC<AddUrlModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!url.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une URL.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un titre.',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'URL invalide. Veuillez entrer une URL complète (ex: https://example.com).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const contentData: UrlContentData = {
        url: url.trim(),
        description: description.trim() || undefined,
      };

      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSubmit(title.trim(), contentData, tagsArray);

      // Reset form
      setUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      onClose();
    } catch (error) {
      console.error('Error adding URL:', error);
      // Error toast is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aurentia-pink/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-aurentia-pink" />
            </div>
            <div>
              <DialogTitle>Ajouter une URL</DialogTitle>
              <DialogDescription>
                Ajoutez un lien externe à votre base de connaissance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL input */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Titre du lien"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Description du lien..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

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
            <p className="text-xs text-gray-500">Séparez les tags par des virgules</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange hover:shadow-lg"
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUrlModal;
