/**
 * Integration Help Modal
 * Displays detailed setup instructions for integrations
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INTEGRATION_HELP } from '@/lib/integrationHelpContent';
import type { IntegrationType } from '@/types/integrationTypes';

interface IntegrationHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationType: IntegrationType;
}

export const IntegrationHelpModal = ({
  open,
  onOpenChange,
  integrationType,
}: IntegrationHelpModalProps) => {
  const helpContent = INTEGRATION_HELP[integrationType];

  if (!helpContent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{helpContent.title}</DialogTitle>
          <DialogDescription className="text-base">
            {helpContent.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {helpContent.steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  {step.title}
                </h3>
                <div className="ml-9 text-gray-700 space-y-2">
                  {step.content}
                </div>
                {index < helpContent.steps.length - 1 && (
                  <div className="ml-9 mt-4 border-b border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="default">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
