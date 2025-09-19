export const EMAIL_CONFIRMATION_CONFIG = {
  // Durées
  TOKEN_EXPIRY_HOURS: 24,
  RESEND_COOLDOWN_SECONDS: 60,
  POLLING_INTERVAL_MS: 10000,
  AUTO_REDIRECT_DELAY_MS: 3000,

  // Rate Limiting
  RATE_LIMITS: {
    PER_EMAIL_PER_HOUR: 10,
    PER_IP_PER_HOUR: 15,
    PER_USER_PER_HOUR: 5,
    GLOBAL_PER_HOUR: 1000,
    MAX_ATTEMPTS_PER_TOKEN: 5,
  },

  // Security
  TOKEN_LENGTH_BYTES: 32,
  HASH_ALGORITHM: 'SHA-256',
  
  // Cleanup
  CLEANUP_RETENTION_DAYS: 30,
  CLEANUP_SCHEDULE: '0 2 * * *', // Tous les jours à 2h

  // Email Templates
  TEMPLATES: {
    CONFIRMATION: {
      SUBJECT: 'Confirmez votre email - Aurentia',
      RESEND_SUBJECT: 'Nouveau lien de confirmation - Aurentia',
      FROM_NAME: 'Aurentia',
      FROM_EMAIL: 'noreply@aurentia.fr',
    },
  },

  // URLs
  URLS: {
    CONFIRMATION_PAGE: '/confirm-email',
    LOGIN_AFTER_CONFIRMATION: '/login?confirmed=true',
    SIGNUP_PAGE: '/signup',
    SUPPORT_EMAIL: 'support@aurentia.fr',
  },

  // UI
  UI: {
    MODAL_CLOSE_DELAY_MS: 2000,
    TOAST_DURATION_MS: 5000,
    PROGRESS_UPDATE_INTERVAL_MS: 1000,
  },

  // Development
  DEV: {
    ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
    SKIP_EMAIL_IN_DEV: false,
    USE_SHORT_EXPIRY_IN_DEV: false, // Si true, expire en 5 minutes
  },

  // Feature Flags
  FEATURES: {
    REALTIME_ENABLED: true,
    POLLING_FALLBACK_ENABLED: true,
    AUTO_REDIRECT_ENABLED: true,
    ADMIN_INTERFACE_ENABLED: true,
    METRICS_COLLECTION_ENABLED: true,
    SECURITY_ALERTS_ENABLED: true,
  },
} as const;

// Types dérivés de la configuration
export type EmailConfirmationConfig = typeof EMAIL_CONFIRMATION_CONFIG;

// Helpers pour accéder à la configuration
export class EmailConfirmationConfigHelper {
  static getTokenExpiryMs(): number {
    return EMAIL_CONFIRMATION_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
  }

  static getTokenExpiryDate(): Date {
    return new Date(Date.now() + this.getTokenExpiryMs());
  }

  static isRateLimitExceeded(
    type: 'email' | 'ip' | 'user',
    count: number
  ): boolean {
    const limits = EMAIL_CONFIRMATION_CONFIG.RATE_LIMITS;
    
    switch (type) {
      case 'email':
        return count >= limits.PER_EMAIL_PER_HOUR;
      case 'ip':
        return count >= limits.PER_IP_PER_HOUR;
      case 'user':
        return count >= limits.PER_USER_PER_HOUR;
      default:
        return false;
    }
  }

  static getRetryAfterSeconds(
    type: 'email' | 'ip' | 'user',
    count: number
  ): number {
    const limits = EMAIL_CONFIRMATION_CONFIG.RATE_LIMITS;
    let limit: number;

    switch (type) {
      case 'email':
        limit = limits.PER_EMAIL_PER_HOUR;
        break;
      case 'ip':
        limit = limits.PER_IP_PER_HOUR;
        break;
      case 'user':
        limit = limits.PER_USER_PER_HOUR;
        break;
      default:
        return 3600; // 1 heure par défaut
    }

    // Calculer le temps d'attente basé sur le dépassement
    const overage = count - limit + 1;
    return Math.min(overage * 300, 3600); // Maximum 1 heure
  }

  static shouldEnableFeature(feature: keyof typeof EMAIL_CONFIRMATION_CONFIG.FEATURES): boolean {
    return EMAIL_CONFIRMATION_CONFIG.FEATURES[feature];
  }

  static getConfirmationUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    return `${base}${EMAIL_CONFIRMATION_CONFIG.URLS.CONFIRMATION_PAGE}/${token}`;
  }

  static formatTimeRemaining(expiresAt: string | Date): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Expiré";
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }

    return `${diffMinutes}min`;
  }

  static debugLog(message: string, data?: any): void {
    if (EMAIL_CONFIRMATION_CONFIG.DEV.ENABLE_DEBUG_LOGS) {
      console.log(`[EmailConfirmation] ${message}`, data);
    }
  }

  static isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static getEffectiveTokenExpiry(): Date {
    if (this.isDevMode() && EMAIL_CONFIRMATION_CONFIG.DEV.USE_SHORT_EXPIRY_IN_DEV) {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes en dev
    }
    return this.getTokenExpiryDate();
  }
}

// Export des constantes utiles
export const {
  TOKEN_EXPIRY_HOURS,
  RESEND_COOLDOWN_SECONDS,
  RATE_LIMITS,
  URLS,
  TEMPLATES,
} = EMAIL_CONFIRMATION_CONFIG;