import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { useOrganisationData } from "@/hooks/useOrganisationData";
import {
  useNewsletter,
  useCreateNewsletter,
  useUpdateNewsletter,
} from "@/hooks/newsletters/useNewsletters";
import { useSendNewsletter, useScheduleNewsletter } from "@/hooks/newsletters/useSendNewsletter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/newsletters/RichTextEditor";
import { ArrowLeft, Save, Send, Calendar, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { RecipientFilter } from "@/types/newsletterTypes";
import { newsletterTemplates } from "@/utils/newsletterTemplates";

const NewsletterEditor = () => {
  useOrgPageTitle("Éditeur Newsletter");
  const { id, newsletterId } = useParams<{ id: string; newsletterId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!newsletterId;

  const { organisation, loading: orgLoading } = useOrganisationData(id);
  const { data: newsletter, isLoading: newsletterLoading } = useNewsletter(newsletterId);

  const createMutation = useCreateNewsletter();
  const updateMutation = useUpdateNewsletter();
  const sendMutation = useSendNewsletter();
  const scheduleMutation = useScheduleNewsletter();

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter[]>(["adherents"]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(!isEditing);

  // Load newsletter data when editing
  useEffect(() => {
    if (newsletter) {
      setSubject(newsletter.subject);
      setContent(newsletter.content);
      setRecipientFilter(newsletter.recipient_filter as RecipientFilter[]);
    }
  }, [newsletter]);

  if (orgLoading || (isEditing && newsletterLoading)) {
    return <LoadingSpinner fullScreen />;
  }

  if (!organisation) {
    return <div className="p-6">Organization not found</div>;
  }

  const handleSave = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a newsletter subject",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && newsletterId) {
      await updateMutation.mutateAsync({
        id: newsletterId,
        updates: { subject, content, recipient_filter: recipientFilter },
      });
    } else {
      const result = await createMutation.mutateAsync({
        organization_id: id!,
        subject,
        content,
        recipient_filter: recipientFilter,
      });
      navigate(`/organisation/${id}/newsletters/${result.id}/edit`);
    }
  };

  const handleSend = async () => {
    if (!newsletterId) {
      toast({
        title: "Save first",
        description: "Please save the newsletter before sending",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to send this newsletter to all recipients?")) {
      await sendMutation.mutateAsync(newsletterId);
      navigate(`/organisation/${id}/newsletters`);
    }
  };

  const toggleRecipient = (recipient: RecipientFilter) => {
    setRecipientFilter((current) => {
      if (current.includes(recipient)) {
        return current.filter((r) => r !== recipient);
      } else {
        return [...current, recipient];
      }
    });
  };

  const handleTemplateSelect = (template: typeof newsletterTemplates[number]) => {
    setSubject(template.subject.replace("{Organization Name}", organisation?.name || ""));
    setContent(template.content);
    setShowTemplateDialog(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Newsletter Template</DialogTitle>
            <DialogDescription>
              Select a template to get started, or choose "Blank Template" to start from scratch
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 py-4">
            {newsletterTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {template.id !== "blank" && (
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Subject:</p>
                      <p className="italic">{template.subject}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/organisation/${id}/newsletters`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Newsletters
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Newsletter" : "Create Newsletter"}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {isEditing && newsletter?.status === "draft" && (
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="btn-white-label hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Details</CardTitle>
            <CardDescription>Enter the subject and content of your newsletter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter newsletter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                organizationId={id}
                newsletterId={newsletterId}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Select who should receive this newsletter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="adherents"
                checked={recipientFilter.includes("adherents")}
                onCheckedChange={() => toggleRecipient("adherents")}
              />
              <label
                htmlFor="adherents"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                All Adherents (Members)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentors"
                checked={recipientFilter.includes("mentors")}
                onCheckedChange={() => toggleRecipient("mentors")}
              />
              <label
                htmlFor="mentors"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                All Mentors
              </label>
            </div>
            {recipientFilter.length === 0 && (
              <p className="text-sm text-destructive">
                Please select at least one recipient group
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsletterEditor;
