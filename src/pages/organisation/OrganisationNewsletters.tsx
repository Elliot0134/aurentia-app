import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { useOrganisationData } from "@/hooks/useOrganisationData";
import { useNewsletters, useDeleteNewsletter } from "@/hooks/newsletters/useNewsletters";
import { useSendNewsletter } from "@/hooks/newsletters/useSendNewsletter";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Send, Eye, Trash2, Calendar, Users, Download, Lock, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { exportNewslettersToCSV } from "@/utils/csvExport";

const OrganisationNewsletters = () => {
  useOrgPageTitle("Newsletters");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useOrganisationData(id);
  const { data: newsletters, isLoading } = useNewsletters(id || "");
  const sendMutation = useSendNewsletter();
  const deleteMutation = useDeleteNewsletter();
  const { canManageNewsletters, isOwner, isLoading: permissionsLoading } = useStaffPermissions();

  const [selectedNewsletters, setSelectedNewsletters] = useState<Set<string>>(new Set());

  // Check if user has permission to manage newsletters
  const hasManagePermission = canManageNewsletters || isOwner;

  if (orgLoading || isLoading || permissionsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!organisation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const handleSend = async (newsletterId: string, subject: string) => {
    if (confirm(`Are you sure you want to send "${subject}" to all recipients?`)) {
      await sendMutation.mutateAsync(newsletterId);
    }
  };

  const handleDelete = async (newsletterId: string, subject: string) => {
    if (confirm(`Are you sure you want to delete "${subject}"? This cannot be undone.`)) {
      await deleteMutation.mutateAsync(newsletterId);
    }
  };

  const toggleNewsletterSelection = (newsletterId: string) => {
    const newSelection = new Set(selectedNewsletters);
    if (newSelection.has(newsletterId)) {
      newSelection.delete(newsletterId);
    } else {
      newSelection.add(newsletterId);
    }
    setSelectedNewsletters(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedNewsletters.size === newsletters?.length) {
      setSelectedNewsletters(new Set());
    } else {
      setSelectedNewsletters(new Set(newsletters?.map((n) => n.id) || []));
    }
  };

  const handleExportSelected = () => {
    if (selectedNewsletters.size === 0) {
      toast({
        title: "No newsletters selected",
        description: "Please select at least one newsletter to export",
        variant: "destructive",
      });
      return;
    }
    const selected = newsletters?.filter((n) => selectedNewsletters.has(n.id)) || [];
    exportNewslettersToCSV(selected);
    toast({
      title: "Export successful",
      description: `Exported ${selected.length} newsletter(s) to CSV`,
    });
  };

  const handleExportAll = () => {
    if (!newsletters || newsletters.length === 0) {
      toast({
        title: "No newsletters to export",
        description: "Create some newsletters first",
        variant: "destructive",
      });
      return;
    }
    exportNewslettersToCSV(newsletters);
    toast({
      title: "Export successful",
      description: `Exported ${newsletters.length} newsletter(s) to CSV`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "default", label: "Scheduled" },
      sending: { variant: "default", label: "Sending..." },
      sent: { variant: "default", label: "Sent" },
      failed: { variant: "destructive", label: "Failed" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletters</h1>
          <p className="text-muted-foreground mt-1">
            Create and send newsletters to your organization members
          </p>
        </div>
        {hasManagePermission && (
          <Button
            onClick={() => navigate(`/organisation/${id}/newsletters/create`)}
            className="btn-white-label hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
        )}
      </div>

      {!hasManagePermission && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have read-only access to newsletters. Contact the organization owner to request newsletter management permissions.
          </AlertDescription>
        </Alert>
      )}

      {newsletters && newsletters.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedNewsletters.size === newsletters.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedNewsletters.size > 0
                ? `${selectedNewsletters.size} selected`
                : "Select all"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              disabled={selectedNewsletters.size === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      )}

      {(!newsletters || newsletters.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            {hasManagePermission ? (
              <>
                <Send className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Get started by creating your first newsletter to communicate with your members.
                </p>
                <Button
                  onClick={() => navigate(`/organisation/${id}/newsletters/create`)}
                  className="btn-white-label hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              </>
            ) : (
              <>
                <Lock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  No newsletters have been created for this organization yet.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {newsletters?.map((newsletter) => (
          <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedNewsletters.has(newsletter.id)}
                    onCheckedChange={() => toggleNewsletterSelection(newsletter.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{newsletter.subject}</CardTitle>
                      {getStatusBadge(newsletter.status)}
                    </div>
                    <CardDescription>
                      Created {format(new Date(newsletter.created_at), "PPP")}
                      {newsletter.scheduled_at && (
                        <span className="ml-2">
                          • Scheduled for {format(new Date(newsletter.scheduled_at), "PPP 'at' p")}
                        </span>
                      )}
                      {newsletter.sent_at && (
                        <span className="ml-2">
                          • Sent {format(new Date(newsletter.sent_at), "PPP 'at' p")}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {newsletter.total_recipients} recipients
                    </span>
                  </div>
                  {newsletter.status === "sent" && (
                    <>
                      <div>
                        Delivered: {newsletter.delivered_count} (
                        {newsletter.delivery_rate?.toFixed(0)}%)
                      </div>
                      <div>
                        Read: {newsletter.read_count} ({newsletter.read_rate?.toFixed(0)}%)
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organisation/${id}/newsletters/${newsletter.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {hasManagePermission && newsletter.status === "draft" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/organisation/${id}/newsletters/${newsletter.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSend(newsletter.id, newsletter.subject)}
                        disabled={sendMutation.isPending}
                        className="btn-white-label hover:opacity-90"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </>
                  )}
                  {hasManagePermission && newsletter.status === "scheduled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/organisation/${id}/newsletters/${newsletter.id}/edit`)
                      }
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Edit Schedule
                    </Button>
                  )}
                  {hasManagePermission && ["draft", "failed"].includes(newsletter.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(newsletter.id, newsletter.subject)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganisationNewsletters;
