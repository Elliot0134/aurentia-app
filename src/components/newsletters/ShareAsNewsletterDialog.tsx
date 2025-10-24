import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { createNewsletterFromResource } from "@/services/newsletterService";
import type { Resource } from "@/types/resourceTypes";
import type { RecipientFilter } from "@/types/newsletterTypes";
import { Loader2, Mail, Users, UserCheck } from "lucide-react";

interface ShareAsNewsletterDialogProps {
  resource: Resource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareAsNewsletterDialog = ({
  resource,
  open,
  onOpenChange,
}: ShareAsNewsletterDialogProps) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(resource.title);
  const [recipientFilters, setRecipientFilters] = useState<{
    adherents: boolean;
    mentors: boolean;
  }>({
    adherents: true,
    mentors: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    // Build recipient filter array
    const filters: RecipientFilter[] = [];
    if (recipientFilters.adherents && recipientFilters.mentors) {
      filters.push("all");
    } else {
      if (recipientFilters.adherents) filters.push("adherents");
      if (recipientFilters.mentors) filters.push("mentors");
    }

    if (filters.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient group",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newsletter = await createNewsletterFromResource(
        resource.id,
        resource.organization_id,
        subject,
        filters
      );

      toast({
        title: "Newsletter created!",
        description: `"${subject}" has been created as a draft newsletter.`,
      });

      onOpenChange(false);

      // Navigate to newsletter editor
      navigate(
        `/organisation/${resource.organization_id}/newsletters/${newsletter.id}`
      );
    } catch (error) {
      console.error("Error creating newsletter:", error);
      toast({
        title: "Failed to create newsletter",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the newsletter",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Share as Newsletter
          </DialogTitle>
          <DialogDescription>
            Create a newsletter from this resource. The newsletter will be created
            as a draft and can be edited before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Newsletter Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject..."
            />
          </div>

          {/* Recipient Selection */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adherents"
                  checked={recipientFilters.adherents}
                  onCheckedChange={(checked) =>
                    setRecipientFilters((prev) => ({
                      ...prev,
                      adherents: checked === true,
                    }))
                  }
                />
                <label
                  htmlFor="adherents"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-4 w-4 text-blue-500" />
                  Members / Entrepreneurs
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mentors"
                  checked={recipientFilters.mentors}
                  onCheckedChange={(checked) =>
                    setRecipientFilters((prev) => ({
                      ...prev,
                      mentors: checked === true,
                    }))
                  }
                />
                <label
                  htmlFor="mentors"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Mentors
                </label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The newsletter will be created as a draft and
              linked to this resource. Any changes to the resource can be synced
              to the newsletter later.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !subject.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Create Newsletter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
