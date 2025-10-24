/**
 * Video embed utilities
 * Supports YouTube, Vimeo, and Dailymotion
 */

export type VideoPlatform = 'youtube' | 'vimeo' | 'dailymotion' | 'other';

export interface VideoEmbedInfo {
  platform: VideoPlatform;
  embedId: string;
  embedUrl: string;
  thumbnailUrl?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract Vimeo video ID from URL
 * Supports:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
export const extractVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract Dailymotion video ID from URL
 * Supports:
 * - https://www.dailymotion.com/video/VIDEO_ID
 * - https://dai.ly/VIDEO_ID
 */
export const extractDailymotionId = (url: string): string | null => {
  const patterns = [
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
    /dai\.ly\/([a-zA-Z0-9]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Detect video platform from URL and extract embed info
 */
export const detectVideoEmbed = (url: string): VideoEmbedInfo | null => {
  const trimmedUrl = url.trim();

  // Try YouTube
  const youtubeId = extractYouTubeId(trimmedUrl);
  if (youtubeId) {
    return {
      platform: 'youtube',
      embedId: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    };
  }

  // Try Vimeo
  const vimeoId = extractVimeoId(trimmedUrl);
  if (vimeoId) {
    return {
      platform: 'vimeo',
      embedId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`
    };
  }

  // Try Dailymotion
  const dailymotionId = extractDailymotionId(trimmedUrl);
  if (dailymotionId) {
    return {
      platform: 'dailymotion',
      embedId: dailymotionId,
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionId}`
    };
  }

  return null;
};

/**
 * Generate embed iframe HTML
 */
export const generateEmbedIframe = (
  embedUrl: string,
  title?: string,
  aspectRatio: '16:9' | '4:3' = '16:9'
): string => {
  const paddingBottom = aspectRatio === '16:9' ? '56.25%' : '75%';

  return `
    <div style="position: relative; padding-bottom: ${paddingBottom}; height: 0; overflow: hidden; max-width: 100%; border-radius: 0.5rem;">
      <iframe
        src="${embedUrl}"
        title="${title || 'Video'}"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  `;
};

/**
 * Check if a string is a valid video URL
 */
export const isVideoUrl = (url: string): boolean => {
  return detectVideoEmbed(url) !== null;
};

/**
 * Get video platform name for display
 */
export const getVideoPlatformName = (platform: VideoPlatform): string => {
  const names: Record<VideoPlatform, string> = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    dailymotion: 'Dailymotion',
    other: 'Vidéo'
  };

  return names[platform] || 'Vidéo';
};

/**
 * Get YouTube thumbnail URL with quality option
 */
export const getYouTubeThumbnail = (
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'
): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};
