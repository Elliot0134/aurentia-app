import React, { useState } from 'react';
import { Type, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import type { TextContentData } from '@/types/knowledgeBaseTypes';

interface CreateTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, contentData: TextContentData, tags: string[]) => Promise<void>;
}

const CreateTextModal: React.FC<CreateTextModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un titre.',
        variant: 'destructive',
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer du texte.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const contentData: TextContentData = {
        text: text.trim(),
        description: description.trim() || undefined,
      };

      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSubmit(title.trim(), contentData, tagsArray);

      // Reset form
      setTitle('');
      setText('');
      setDescription('');
      setTags('');
      onClose();
    } catch (error) {
      console.error('Error creating text:', error);
      // Error toast is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setText('');
      setDescription('');
      setTags('');
      onClose();
    }
  };

  // Calculate character and word count
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aurentia-pink/10 flex items-center justify-center">
              <Type className="w-5 h-5 text-aurentia-pink" />
            </div>
            <div>
              <DialogTitle>Créer une entrée texte</DialogTitle>
              <DialogDescription>
                Ajoutez du texte ou des notes à votre base de connaissance
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Titre de l'entrée"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Text content */}
          <div className="space-y-2">
            <Label htmlFor="text">Texte *</Label>
            <Textarea
              id="text"
              placeholder="Entrez votre texte ici..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
              <span>{charCount} caractère{charCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Description ou résumé..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={2}
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
            {isLoading ? 'Création en cours...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTextModal;
