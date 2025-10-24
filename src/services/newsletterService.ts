import { supabase } from "@/integrations/supabase/client";
import { sendOrganizationMessage, findOrCreateDirectConversation } from "./messageService";
import { convertResourceToHTML } from "./resourceToNewsletterConverter";
import { getResourceById } from "./resourcesService";
import type {
  Newsletter,
  NewsletterWithDetails,
  NewsletterRecipient,
  NewsletterRecipientWithUser,
  NewsletterResource,
  CreateNewsletterRequest,
  UpdateNewsletterRequest,
  NewsletterStats,
  NewsletterAnalytics,
  RecipientFilter,
} from "@/types/newsletterTypes";

// =============================================
// NEWSLETTER CRUD OPERATIONS
// =============================================

export const getNewsletters = async (
  organizationId: string,
  status?: string
): Promise<NewsletterWithDetails[]> => {
  let query = supabase
    .from("org_newsletters")
    .select(
      `
      *,
      creator:profiles!org_newsletters_created_by_fkey (
        id,
        email,
        first_name,
        last_name
      ),
      resources:org_newsletter_resources (
        id,
        resource_id,
        display_order,
        resource:resources (
          id,
          title,
          description,
          type,
          thumbnail_url
        )
      )
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Calculate rates
  const newsletters: NewsletterWithDetails[] = (data || []).map((newsletter) => ({
    ...newsletter,
    delivery_rate: newsletter.total_recipients > 0
      ? (newsletter.delivered_count / newsletter.total_recipients) * 100
      : 0,
    read_rate: newsletter.total_recipients > 0
      ? (newsletter.read_count / newsletter.total_recipients) * 100
      : 0,
  }));

  return newsletters;
};

export const getNewsletterById = async (
  id: string
): Promise<NewsletterWithDetails | null> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .select(
      `
      *,
      creator:profiles!org_newsletters_created_by_fkey (
        id,
        email,
        first_name,
        last_name
      ),
      resources:org_newsletter_resources (
        id,
        resource_id,
        display_order,
        resource:resources (
          id,
          title,
          description,
          type,
          thumbnail_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    delivery_rate: data.total_recipients > 0
      ? (data.delivered_count / data.total_recipients) * 100
      : 0,
    read_rate: data.total_recipients > 0
      ? (data.read_count / data.total_recipients) * 100
      : 0,
  };
};

export const createNewsletter = async (
  request: CreateNewsletterRequest
): Promise<Newsletter> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("org_newsletters")
    .insert({
      organization_id: request.organization_id,
      subject: request.subject,
      content: request.content,
      recipient_filter: request.recipient_filter,
      scheduled_at: request.scheduled_at,
      created_by: currentUser.id,
      status: request.scheduled_at ? "scheduled" : "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateNewsletter = async (
  id: string,
  updates: UpdateNewsletterRequest
): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteNewsletter = async (id: string): Promise<void> => {
  const { error } = await supabase.from("org_newsletters").delete().eq("id", id);
  if (error) throw error;
};

export const duplicateNewsletter = async (id: string): Promise<Newsletter> => {
  // Get original newsletter
  const original = await getNewsletterById(id);
  if (!original) throw new Error("Newsletter not found");

  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  // Create duplicate
  const { data, error } = await supabase
    .from("org_newsletters")
    .insert({
      organization_id: original.organization_id,
      subject: `Copy of ${original.subject}`,
      content: original.content,
      recipient_filter: original.recipient_filter,
      created_by: currentUser.id,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  // Duplicate resources if any
  if (original.resources && original.resources.length > 0) {
    const resourceInserts = original.resources.map((r) => ({
      newsletter_id: data.id,
      resource_id: r.resource_id,
      display_order: r.display_order,
    }));

    await supabase.from("org_newsletter_resources").insert(resourceInserts);
  }

  return data;
};

// =============================================
// RESOURCE MANAGEMENT
// =============================================

export const attachResource = async (
  newsletterId: string,
  resourceId: string,
  displayOrder?: number
): Promise<NewsletterResource> => {
  // Get current max display_order
  const { data: existing } = await supabase
    .from("org_newsletter_resources")
    .select("display_order")
    .eq("newsletter_id", newsletterId)
    .order("display_order", { ascending: false })
    .limit(1);

  const order = displayOrder ?? ((existing && existing[0]?.display_order) || 0) + 1;

  const { data, error } = await supabase
    .from("org_newsletter_resources")
    .insert({
      newsletter_id: newsletterId,
      resource_id: resourceId,
      display_order: order,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const detachResource = async (
  newsletterId: string,
  resourceId: string
): Promise<void> => {
  const { error } = await supabase
    .from("org_newsletter_resources")
    .delete()
    .eq("newsletter_id", newsletterId)
    .eq("resource_id", resourceId);

  if (error) throw error;
};

export const getNewsletterResources = async (
  newsletterId: string
): Promise<NewsletterResource[]> => {
  const { data, error } = await supabase
    .from("org_newsletter_resources")
    .select("*")
    .eq("newsletter_id", newsletterId)
    .order("display_order");

  if (error) throw error;
  return data || [];
};

// =============================================
// RECIPIENT MANAGEMENT
// =============================================

export const getNewsletterRecipients = async (
  newsletterId: string
): Promise<NewsletterRecipientWithUser[]> => {
  const { data, error } = await supabase
    .from("org_newsletter_recipients")
    .select(
      `
      *,
      user:profiles!org_newsletter_recipients_user_id_fkey (
        id,
        email,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("newsletter_id", newsletterId)
    .order("created_at");

  if (error) throw error;
  return data || [];
};

// =============================================
// SENDING LOGIC
// =============================================

export const sendNewsletter = async (newsletterId: string): Promise<void> => {
  // Get newsletter details
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");

  if (newsletter.status === "sent") {
    throw new Error("Newsletter has already been sent");
  }

  // Update status to 'sending'
  await supabase
    .from("org_newsletters")
    .update({ status: "sending" })
    .eq("id", newsletterId);

  try {
    // Get organization members based on recipient_filter
    const recipients = await getRecipientsForNewsletter(
      newsletter.organization_id,
      newsletter.recipient_filter as RecipientFilter[]
    );

    // Update total_recipients
    await supabase
      .from("org_newsletters")
      .update({ total_recipients: recipients.length })
      .eq("id", newsletterId);

    // Get attached resources
    const resources = await getNewsletterResources(newsletterId);

    // Send to each recipient
    let deliveredCount = 0;
    const recipientRecords: any[] = [];

    for (const recipient of recipients) {
      try {
        // Find or create 1-on-1 conversation
        const conversation = await findOrCreateDirectConversation(recipient.id);

        // Prepare newsletter content with resources
        let messageContent = newsletter.content;

        // If resources attached, add them to metadata
        const metadata: any = { newsletter_id: newsletterId };
        if (resources.length > 0) {
          metadata.resources = resources.map((r) => ({
            resource_id: r.resource_id,
            display_order: r.display_order,
          }));
        }

        // Send message as organization
        const message = await sendOrganizationMessage(
          conversation.id,
          newsletter.organization_id,
          messageContent
        );

        // Record successful delivery
        recipientRecords.push({
          newsletter_id: newsletterId,
          user_id: recipient.id,
          conversation_id: conversation.id,
          message_id: message.id,
          status: "delivered",
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
        });

        deliveredCount++;
      } catch (err) {
        console.error(`Failed to send to user ${recipient.id}:`, err);
        // Record failed delivery
        recipientRecords.push({
          newsletter_id: newsletterId,
          user_id: recipient.id,
          status: "failed",
          error_message: err instanceof Error ? err.message : "Unknown error",
          sent_at: new Date().toISOString(),
        });
      }
    }

    // Bulk insert recipient records
    if (recipientRecords.length > 0) {
      await supabase.from("org_newsletter_recipients").insert(recipientRecords);
    }

    // Update newsletter status
    await supabase
      .from("org_newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        delivered_count: deliveredCount,
      })
      .eq("id", newsletterId);
  } catch (err) {
    // Mark as failed
    await supabase
      .from("org_newsletters")
      .update({ status: "failed" })
      .eq("id", newsletterId);
    throw err;
  }
};

export const scheduleNewsletter = async (
  newsletterId: string,
  scheduledAt: string
): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .update({
      scheduled_at: scheduledAt,
      status: "scheduled",
    })
    .eq("id", newsletterId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const cancelScheduledNewsletter = async (
  newsletterId: string
): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .update({
      scheduled_at: null,
      status: "draft",
    })
    .eq("id", newsletterId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper: Get recipients based on filter
const getRecipientsForNewsletter = async (
  organizationId: string,
  recipientFilter: RecipientFilter[]
): Promise<Array<{ id: string; email: string }>> => {
  const filters: string[] = [];

  if (recipientFilter.includes("all") || recipientFilter.includes("adherents")) {
    filters.push("member");
  }
  if (recipientFilter.includes("all") || recipientFilter.includes("mentors")) {
    filters.push("mentor");
  }

  if (filters.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_organizations")
    .select(
      `
      user_id,
      user:profiles!user_organizations_user_id_fkey (
        id,
        email
      )
    `
    )
    .eq("organization_id", organizationId)
    .in("user_role", filters)
    .eq("status", "active");

  if (error) throw error;

  return (data || [])
    .filter((item) => item.user)
    .map((item) => ({
      id: item.user.id,
      email: item.user.email,
    }));
};

// =============================================
// ANALYTICS & STATS
// =============================================

export const getNewsletterStats = async (
  newsletterId: string
): Promise<NewsletterStats> => {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");

  // Get recipient counts by status
  const { data: recipients } = await supabase
    .from("org_newsletter_recipients")
    .select("status, sent_at, read_at")
    .eq("newsletter_id", newsletterId);

  const statusCounts = {
    pending: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  };

  let totalReadTime = 0;
  let readCount = 0;

  (recipients || []).forEach((r) => {
    statusCounts[r.status]++;

    // Calculate time to read
    if (r.read_at && r.sent_at) {
      const sentTime = new Date(r.sent_at).getTime();
      const readTime = new Date(r.read_at).getTime();
      totalReadTime += (readTime - sentTime) / 1000 / 60; // Convert to minutes
      readCount++;
    }
  });

  return {
    newsletter_id: newsletterId,
    total_recipients: newsletter.total_recipients,
    sent_count: statusCounts.sent + statusCounts.delivered + statusCounts.read,
    delivered_count: newsletter.delivered_count,
    read_count: newsletter.read_count,
    failed_count: statusCounts.failed,
    delivery_rate: newsletter.delivery_rate || 0,
    read_rate: newsletter.read_rate || 0,
    avg_time_to_read: readCount > 0 ? totalReadTime / readCount : undefined,
  };
};

export const getNewsletterAnalytics = async (
  newsletterId: string
): Promise<NewsletterAnalytics> => {
  const stats = await getNewsletterStats(newsletterId);
  const recipients = await getNewsletterRecipients(newsletterId);

  // Calculate delivery timeline (hourly buckets)
  const timelineBuckets: Record<
    string,
    { sent: number; delivered: number; read: number }
  > = {};

  recipients.forEach((r) => {
    if (r.sent_at) {
      const hour = new Date(r.sent_at).toISOString().slice(0, 13) + ":00:00.000Z";
      if (!timelineBuckets[hour]) {
        timelineBuckets[hour] = { sent: 0, delivered: 0, read: 0 };
      }
      timelineBuckets[hour].sent++;

      if (r.status === "delivered" || r.status === "read") {
        timelineBuckets[hour].delivered++;
      }
      if (r.status === "read") {
        timelineBuckets[hour].read++;
      }
    }
  });

  const delivery_timeline = Object.entries(timelineBuckets)
    .map(([hour, counts]) => ({
      hour,
      ...counts,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Status distribution
  const status_distribution = {
    pending: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  };

  recipients.forEach((r) => {
    status_distribution[r.status]++;
  });

  return {
    stats,
    recipients,
    delivery_timeline,
    status_distribution,
  };
};

// =============================================
// RESOURCE LINKING & SYNC
// =============================================

/**
 * Create a newsletter from a resource
 */
export const createNewsletterFromResource = async (
  resourceId: string,
  organizationId: string,
  subject?: string,
  recipientFilter?: RecipientFilter[]
): Promise<Newsletter> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  // Get the resource
  const resource = await getResourceById(resourceId);
  if (!resource) throw new Error("Resource not found");

  if (resource.organization_id !== organizationId) {
    throw new Error("Resource does not belong to this organization");
  }

  // Convert resource content to HTML
  const htmlContent = convertResourceToHTML(resource);

  // Create newsletter
  const { data, error } = await supabase
    .from("org_newsletters")
    .insert({
      organization_id: organizationId,
      subject: subject || resource.title,
      content: htmlContent,
      recipient_filter: recipientFilter || ["all"],
      created_by: currentUser.id,
      status: "draft",
      source_resource_id: resourceId,
      resource_version: 1, // Initial version
      sync_enabled: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Sync newsletter content from its source resource
 */
export const syncNewsletterFromResource = async (
  newsletterId: string
): Promise<Newsletter> => {
  // Get newsletter
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");

  if (!newsletter.source_resource_id) {
    throw new Error("Newsletter is not linked to a resource");
  }

  if (!newsletter.sync_enabled) {
    throw new Error("Sync is disabled for this newsletter");
  }

  // Get the source resource
  const resource = await getResourceById(newsletter.source_resource_id);
  if (!resource) {
    throw new Error("Source resource not found");
  }

  // Convert resource content to HTML
  const htmlContent = convertResourceToHTML(resource);

  // Update newsletter
  const { data, error } = await supabase
    .from("org_newsletters")
    .update({
      content: htmlContent,
      resource_version: (newsletter.resource_version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", newsletterId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all newsletters linked to a resource
 */
export const getResourceLinkedNewsletters = async (
  resourceId: string
): Promise<NewsletterWithDetails[]> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .select(
      `
      *,
      creator:profiles!org_newsletters_created_by_fkey (
        id,
        email,
        first_name,
        last_name
      )
    `
    )
    .eq("source_resource_id", resourceId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Calculate rates
  const newsletters: NewsletterWithDetails[] = (data || []).map((newsletter) => ({
    ...newsletter,
    delivery_rate:
      newsletter.total_recipients > 0
        ? (newsletter.delivered_count / newsletter.total_recipients) * 100
        : 0,
    read_rate:
      newsletter.total_recipients > 0
        ? (newsletter.read_count / newsletter.total_recipients) * 100
        : 0,
  }));

  return newsletters;
};

/**
 * Unlink a newsletter from its source resource
 */
export const unlinkNewsletterFromResource = async (
  newsletterId: string
): Promise<Newsletter> => {
  const { data, error } = await supabase
    .from("org_newsletters")
    .update({
      source_resource_id: null,
      sync_enabled: false,
    })
    .eq("id", newsletterId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Toggle sync for a resource-linked newsletter
 */
export const toggleNewsletterSync = async (
  newsletterId: string,
  enabled: boolean
): Promise<Newsletter> => {
  const { data, error} = await supabase
    .from("org_newsletters")
    .update({
      sync_enabled: enabled,
    })
    .eq("id", newsletterId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
