import type { NewsletterWithDetails } from "@/types/newsletterTypes";
import { format } from "date-fns";

export const exportNewslettersToCSV = (newsletters: NewsletterWithDetails[]) => {
  if (newsletters.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = [
    "Title",
    "Subject",
    "Status",
    "Created Date",
    "Sent Date",
    "Scheduled Date",
    "Total Recipients",
    "Delivered Count",
    "Delivery Rate (%)",
    "Read Count",
    "Read Rate (%)",
    "Failed Count",
    "Creator Email",
    "Content Preview",
  ];

  // Convert newsletters to CSV rows
  const rows = newsletters.map((newsletter) => {
    // Strip HTML from content and truncate for preview
    const contentPreview = newsletter.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .substring(0, 200) + "..."; // Truncate to 200 chars

    return [
      newsletter.subject,
      newsletter.subject,
      newsletter.status,
      newsletter.created_at ? format(new Date(newsletter.created_at), "yyyy-MM-dd HH:mm") : "",
      newsletter.sent_at ? format(new Date(newsletter.sent_at), "yyyy-MM-dd HH:mm") : "",
      newsletter.scheduled_at ? format(new Date(newsletter.scheduled_at), "yyyy-MM-dd HH:mm") : "",
      newsletter.total_recipients,
      newsletter.delivered_count,
      newsletter.delivery_rate?.toFixed(2) || "0",
      newsletter.read_count,
      newsletter.read_rate?.toFixed(2) || "0",
      newsletter.total_recipients - newsletter.delivered_count,
      newsletter.creator?.email || "",
      `"${contentPreview.replace(/"/g, '""')}"`, // Escape quotes in content
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `newsletters_export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportNewsletterRecipientsToCSV = (
  newsletterSubject: string,
  recipients: Array<{
    id: string;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    error_message: string | null;
    user?: {
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
  }>
) => {
  if (recipients.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = [
    "Name",
    "Email",
    "Status",
    "Sent At",
    "Delivered At",
    "Read At",
    "Time to Read (minutes)",
    "Error Message",
  ];

  // Convert recipients to CSV rows
  const rows = recipients.map((recipient) => {
    const name = recipient.user
      ? `${recipient.user.first_name || ""} ${recipient.user.last_name || ""}`.trim()
      : "";

    let timeToRead = "";
    if (recipient.sent_at && recipient.read_at) {
      const sentTime = new Date(recipient.sent_at).getTime();
      const readTime = new Date(recipient.read_at).getTime();
      const minutes = Math.round((readTime - sentTime) / 1000 / 60);
      timeToRead = minutes.toString();
    }

    return [
      name,
      recipient.user?.email || "",
      recipient.status,
      recipient.sent_at ? format(new Date(recipient.sent_at), "yyyy-MM-dd HH:mm") : "",
      recipient.delivered_at ? format(new Date(recipient.delivered_at), "yyyy-MM-dd HH:mm") : "",
      recipient.read_at ? format(new Date(recipient.read_at), "yyyy-MM-dd HH:mm") : "",
      timeToRead,
      recipient.error_message ? `"${recipient.error_message.replace(/"/g, '""')}"` : "",
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  const safeSubject = newsletterSubject.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `newsletter_${safeSubject}_recipients_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
