import React, { useState } from 'react';
import { Download, FileText, Code } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { OrganizationResource } from '@/types/resourceTypes';
import { exportToMarkdown, exportToHTML, downloadAsFile } from '@/services/exportService';
import { toast } from '@/components/ui/use-toast';

interface ExportDialogProps {
  resource: OrganizationResource;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'markdown' | 'html';

export function ExportDialog({ resource, isOpen, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = resource.title.toLowerCase().replace(/\s+/g, '-');

      switch (selectedFormat) {
        case 'markdown':
          const markdown = exportToMarkdown(resource);
          downloadAsFile(markdown, `${filename}.md`, 'text/markdown');
          toast({ title: 'Export réussi', description: 'Fichier Markdown téléchargé' });
          break;

        case 'html':
          const html = exportToHTML(resource);
          downloadAsFile(html, `${filename}.html`, 'text/html');
          toast({ title: 'Export réussi', description: 'Fichier HTML téléchargé' });
          break;

        default:
          throw new Error('Format non supporté');
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible d\'exporter la ressource',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exporter la ressource</DialogTitle>
          <DialogDescription>
            Choisissez le format d'export pour "{resource.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ExportFormat)}>
            <div className="space-y-4">
              {/* Markdown */}
              <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="markdown" id="markdown" />
                <div className="flex-1">
                  <Label htmlFor="markdown" className="flex items-start gap-3 cursor-pointer">
                    <FileText className="w-10 h-10 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-base">Markdown (.md)</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Format texte avec syntaxe Markdown. Idéal pour documentation, GitHub, et outils de développement.
                      </div>
                    </div>
                  </Label>
                </div>
              </div>

              {/* HTML */}
              <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value="html" id="html" />
                <div className="flex-1">
                  <Label htmlFor="html" className="flex items-start gap-3 cursor-pointer">
                    <Code className="w-10 h-10 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-base">HTML (.html)</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Page web autonome avec styles intégrés. Peut être ouverte dans n'importe quel navigateur.
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;
