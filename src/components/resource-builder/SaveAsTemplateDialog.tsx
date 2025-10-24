import React, { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { OrganizationResource } from '@/types/resourceTypes';

interface SaveAsTemplateDialogProps {
  resource: OrganizationResource;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TEMPLATE_CATEGORIES = [
  { value: 'guide', label: 'Guide / Documentation' },
  { value: 'formation', label: 'Formation' },
  { value: 'processus', label: 'Processus / Procédure' },
  { value: 'communication', label: 'Communication' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technique', label: 'Technique' },
  { value: 'business', label: 'Business' },
  { value: 'autre', label: 'Autre' },
];

const TEMPLATE_ICONS = [
  '📚', '📖', '📝', '✏️', '📋', '📊', '📈', '💡',
  '🎯', '🚀', '⚙️', '🔧', '💼', '📱', '🌟', '✨'
];

export function SaveAsTemplateDialog({
  resource,
  isOpen,
  onClose,
  onSuccess,
}: SaveAsTemplateDialogProps) {
  const [name, setName] = useState(resource.title);
  const [description, setDescription] = useState(resource.description || '');
  const [category, setCategory] = useState('guide');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('resource_templates')
        .insert({
          organization_id: resource.organization_id,
          name: name.trim(),
          description: description.trim() || null,
          category,
          icon: selectedIcon,
          tags: tags.length > 0 ? tags : null,
          content: resource.content,
          is_public: isPublic,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-templates'] });
      toast({
        title: 'Modèle créé',
        description: 'Votre ressource a été sauvegardée comme modèle',
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le modèle',
        variant: 'destructive',
      });
    },
  });

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du modèle est requis',
        variant: 'destructive',
      });
      return;
    }
    saveTemplateMutation.mutate();
  };

  const handleClose = () => {
    setName(resource.title);
    setDescription(resource.description || '');
    setCategory('guide');
    setSelectedIcon('📚');
    setTags([]);
    setTagInput('');
    setIsPublic(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sauvegarder comme modèle
          </DialogTitle>
          <DialogDescription>
            Créez un modèle réutilisable à partir de cette ressource pour gagner du temps lors de la création de futures ressources similaires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="templateName" className="text-sm font-medium">
              Nom du modèle <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Guide de démarrage projet"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="templateDescription" className="text-sm font-medium">
              Description (optionnel)
            </Label>
            <Textarea
              id="templateDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement l'usage de ce modèle..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 caractères
            </p>
          </div>

          {/* Category and Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateCategory" className="text-sm font-medium">
                Catégorie
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="templateCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Icône</Label>
              <div className="grid grid-cols-8 gap-2">
                {TEMPLATE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`
                      w-8 h-8 flex items-center justify-center rounded border-2 transition-all
                      ${selectedIcon === icon
                        ? 'border-primary bg-orange-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="templateTags" className="text-sm font-medium">
              Tags (optionnel)
            </Label>
            <div className="flex gap-2">
              <Input
                id="templateTags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ajoutez un tag et appuyez sur Entrée"
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                Ajouter
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {tags.length}/10 tags
            </p>
          </div>

          {/* Public option */}
          <div className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
            />
            <div className="flex-1">
              <Label
                htmlFor="isPublic"
                className="text-sm font-medium cursor-pointer"
              >
                Rendre ce modèle accessible à toute l'organisation
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Si activé, tous les membres de votre organisation pourront utiliser ce modèle. Sinon, seul vous pourrez l'utiliser.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saveTemplateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="btn-white-label"
              disabled={!name.trim() || saveTemplateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveTemplateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder le modèle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SaveAsTemplateDialog;
