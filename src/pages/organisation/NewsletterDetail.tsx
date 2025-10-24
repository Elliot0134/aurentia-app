import { useParams, useNavigate } from "react-router-dom";
import { useOrganisationData } from "@/hooks/useOrganisationData";
import { useNewsletter } from "@/hooks/newsletters/useNewsletters";
import { useNewsletterStats, useNewsletterRecipients } from "@/hooks/newsletters/useNewsletterStats";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, TrendingUp, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { exportNewsletterRecipientsToCSV } from "@/utils/csvExport";
import { toast } from "@/components/ui/use-toast";

const NewsletterDetail = () => {
  const { id, newsletterId } = useParams<{ id: string; newsletterId: string }>();
  const navigate = useNavigate();

  const { organisation, loading: orgLoading } = useOrganisationData(id);
  const { data: newsletter, isLoading: newsletterLoading } = useNewsletter(newsletterId);
  const { data: stats } = useNewsletterStats(newsletterId);
  const { data: recipients } = useNewsletterRecipients(newsletterId);

  if (orgLoading || newsletterLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!organisation || !newsletter) {
    return <div className="p-6">Newsletter not found</div>;
  }

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
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
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

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{newsletter.subject}</h1>
            {getStatusBadge(newsletter.status)}
          </div>
          <p className="text-muted-foreground">
            Created {format(new Date(newsletter.created_at), "PPP")}
            {newsletter.sent_at && (
              <span> • Sent {format(new Date(newsletter.sent_at), "PPP 'at' p")}</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {newsletter.status === "sent" && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_recipients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered_count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.delivery_rate.toFixed(1)}% delivery rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.read_count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.read_rate.toFixed(1)}% read rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Content</CardTitle>
          <CardDescription>Preview of the newsletter as sent to recipients</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: newsletter.content }}
          />
        </CardContent>
      </Card>

      {/* Recipients List */}
      {recipients && recipients.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recipients ({recipients.length})</CardTitle>
                <CardDescription>Delivery status for each recipient</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportNewsletterRecipientsToCSV(newsletter.subject, recipients);
                  toast({
                    title: "Export successful",
                    description: `Exported ${recipients.length} recipients to CSV`,
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Recipients
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Recipient</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Sent At</th>
                    <th className="text-left py-2 px-4">Read At</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <div>
                          <div className="font-medium">
                            {recipient.user?.first_name} {recipient.user?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {recipient.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <Badge
                          variant={
                            recipient.status === "read"
                              ? "default"
                              : recipient.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {recipient.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {recipient.sent_at ? format(new Date(recipient.sent_at), "PPP p") : "-"}
                      </td>
                      <td className="py-2 px-4 text-sm text-muted-foreground">
                        {recipient.read_at ? format(new Date(recipient.read_at), "PPP p") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsletterDetail;
