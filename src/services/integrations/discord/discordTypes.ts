/**
 * Discord Integration Types
 * Based on Discord Webhook API
 * Documentation: https://discord.com/developers/docs/resources/webhook
 */

// =====================================================
// Discord Embed Types
// =====================================================

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string; // ISO 8601 timestamp
  color?: number; // Decimal color code
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

// =====================================================
// Discord Message
// =====================================================

export interface DiscordMessage {
  content?: string; // Text content (up to 2000 characters)
  username?: string; // Override webhook username
  avatar_url?: string; // Override webhook avatar
  tts?: boolean; // Text-to-speech
  embeds?: DiscordEmbed[]; // Max 10 embeds
  allowed_mentions?: {
    parse?: ('roles' | 'users' | 'everyone')[];
  };
}

// =====================================================
// Discord API Response
// =====================================================

export interface DiscordWebhookResponse {
  id?: string;
  type?: number;
  content?: string;
  embeds?: DiscordEmbed[];
  timestamp?: string;
}

// =====================================================
// Discord Colors (Decimal)
// =====================================================

export const DISCORD_COLORS = {
  // Standard colors
  DEFAULT: 0x000000,
  WHITE: 0xffffff,
  AQUA: 0x1abc9c,
  GREEN: 0x57f287,
  BLUE: 0x3498db,
  YELLOW: 0xfee75c,
  PURPLE: 0x9b59b6,
  LUMINOUS_VIVID_PINK: 0xe91e63,
  FUCHSIA: 0xeb459e,
  GOLD: 0xf1c40f,
  ORANGE: 0xe67e22,
  RED: 0xed4245,
  GREY: 0x95a5a6,
  NAVY: 0x34495e,
  DARK_AQUA: 0x11806a,
  DARK_GREEN: 0x1f8b4c,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368a,
  DARK_VIVID_PINK: 0xad1457,
  DARK_GOLD: 0xc27c0e,
  DARK_ORANGE: 0xa84300,
  DARK_RED: 0x992d22,
  DARK_GREY: 0x979c9f,

  // Aurentia brand colors (converted to decimal)
  AURENTIA_PINK: 0xf04f6a, // #F04F6A
  AURENTIA_ORANGE: 0xff8a5c, // #FF8A5C
} as const;

// =====================================================
// Helper Types
// =====================================================

export interface DiscordMessageOptions {
  includeTimestamp?: boolean;
  includeFooter?: boolean;
  color?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
}
