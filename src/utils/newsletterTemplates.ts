export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  content: string;
}

export const newsletterTemplates: NewsletterTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Newsletter",
    description: "Welcome new members to your organization",
    subject: "Welcome to {Organization Name}!",
    content: `<h1>Welcome!</h1>
<p>We're thrilled to have you join our community. This is the beginning of an exciting journey together.</p>

<h2>What's Next?</h2>
<ul>
  <li>Complete your profile to get started</li>
  <li>Explore our resources and tools</li>
  <li>Connect with other members</li>
  <li>Reach out if you have any questions</li>
</ul>

<p>We're here to support you every step of the way.</p>

<p>Best regards,<br/>
The Team</p>`,
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Share important updates and news",
    subject: "Important Update: {Topic}",
    content: `<h1>Important Announcement</h1>

<p>We wanted to share some important news with you.</p>

<h2>What's Happening</h2>
<p>[Describe the announcement or update here. Be clear and concise about what's changing and why it matters.]</p>

<h2>What This Means for You</h2>
<p>[Explain how this affects your members or what action they need to take.]</p>

<h2>Next Steps</h2>
<ul>
  <li>[Action item 1]</li>
  <li>[Action item 2]</li>
  <li>[Action item 3]</li>
</ul>

<p>If you have any questions, don't hesitate to reach out.</p>

<p>Thank you for your attention.</p>`,
  },
  {
    id: "event",
    name: "Event Invitation",
    description: "Invite members to upcoming events",
    subject: "You're Invited: {Event Name}",
    content: `<h1>You're Invited!</h1>

<p>Join us for an exciting event that you won't want to miss.</p>

<h2>{Event Name}</h2>
<p><strong>Date:</strong> [Date]<br/>
<strong>Time:</strong> [Time]<br/>
<strong>Location:</strong> [Location or Virtual Link]</p>

<h2>What to Expect</h2>
<p>[Describe the event, activities, speakers, or agenda]</p>

<h2>Why You Should Attend</h2>
<ul>
  <li>[Benefit 1]</li>
  <li>[Benefit 2]</li>
  <li>[Benefit 3]</li>
</ul>

<h2>RSVP</h2>
<p>[Instructions for RSVPing or registration link]</p>

<p>We look forward to seeing you there!</p>`,
  },
  {
    id: "monthly_update",
    name: "Monthly Update",
    description: "Monthly recap and upcoming activities",
    subject: "{Month} Update - What's Happening",
    content: `<h1>{Month} Update</h1>

<p>Here's what's been happening and what's coming up.</p>

<h2>This Month's Highlights</h2>
<ul>
  <li>[Achievement or update 1]</li>
  <li>[Achievement or update 2]</li>
  <li>[Achievement or update 3]</li>
</ul>

<h2>Upcoming Events</h2>
<p>[List of upcoming events and important dates]</p>

<h2>Member Spotlight</h2>
<p>[Highlight a member, their achievements, or contribution]</p>

<h2>Resources & Opportunities</h2>
<ul>
  <li>[Resource or opportunity 1]</li>
  <li>[Resource or opportunity 2]</li>
</ul>

<p>Thank you for being part of our community!</p>`,
  },
  {
    id: "newsletter",
    name: "Standard Newsletter",
    description: "General purpose newsletter template",
    subject: "{Organization Name} Newsletter - {Date}",
    content: `<h1>Newsletter</h1>

<p>Welcome to this edition of our newsletter. Here's what we have for you today.</p>

<h2>Featured Story</h2>
<p>[Your main story or announcement goes here]</p>

<h2>Quick Updates</h2>
<ul>
  <li>[Update 1]</li>
  <li>[Update 2]</li>
  <li>[Update 3]</li>
</ul>

<h2>Did You Know?</h2>
<p>[Interesting fact, tip, or insight for your members]</p>

<h2>Upcoming</h2>
<p>[Preview of what's coming next]</p>

<p>Stay connected and keep an eye out for our next update!</p>`,
  },
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch",
    subject: "",
    content: `<p>Start writing your newsletter here...</p>`,
  },
];
