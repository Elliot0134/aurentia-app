import { supabase } from '@/integrations/supabase/client';

export interface EmailConfirmationMetrics {
  totalSent: number;
  totalConfirmed: number;
  totalExpired: number;
  totalFailed: number;
  confirmationRate: number;
  averageConfirmationTime: number; // en minutes
  recentActivity: {
    last24h: number;
    last7days: number;
    last30days: number;
  };
}

export interface EmailConfirmationLog {
  id: string;
  confirmation_id: string | null;
  user_id: string | null;
  action: 'sent' | 'clicked' | 'confirmed' | 'failed' | 'resent' | 'expired' | 'cancelled';
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  error_message: string | null;
  response_time_ms: number | null;
  metadata: any;
  created_at: string;
}

export interface EmailConfirmationDetails extends EmailConfirmationLog {
  email: string;
  user_email: string | null;
  status: string;
  expires_at: string;
  confirmed_at: string | null;
}

export interface RateLimitMetrics {
  byEmail: { email: string; count: number; lastAttempt: string }[];
  byIP: { ip: string; count: number; lastAttempt: string }[];
  byUser: { userId: string; userEmail: string | null; count: number; lastAttempt: string }[];
  blocked: {
    emails: string[];
    ips: string[];
    users: string[];
  };
}

export interface SecurityAlert {
  id: string;
  type: 'rate_limit_exceeded' | 'suspicious_activity' | 'multiple_failures' | 'token_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEmail?: string;
  affectedIP?: string;
  affectedUser?: string;
  metadata: any;
  createdAt: string;
}

class EmailConfirmationAdminService {
  /**
   * Récupère les métriques globales de confirmation d'email
   */
  async getConfirmationMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<EmailConfirmationMetrics> {
    try {
      const { data, error } = await supabase
        .rpc('get_email_confirmation_metrics', {
          p_start_date: startDate || null,
          p_end_date: endDate || null,
        });

      if (error) throw error;

      return data as EmailConfirmationMetrics;
    } catch (error: any) {
      console.error('Erreur récupération métriques:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des métriques');
    }
  }

  /**
   * Récupère les logs d'audit paginés
   */
  async getAuditLogs(
    page: number = 1,
    pageSize: number = 50,
    filters: {
      action?: string;
      success?: boolean;
      userId?: string;
      email?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    logs: EmailConfirmationLog[];
    totalCount: number;
    pageCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_email_confirmation_logs_paginated', {
          p_page: page,
          p_page_size: pageSize,
          p_action: filters.action || null,
          p_success: filters.success ?? null,
          p_user_id: filters.userId || null,
          p_email: filters.email || null,
          p_start_date: filters.startDate || null,
          p_end_date: filters.endDate || null,
        });

      if (error) throw error;

      return data as {
        logs: EmailConfirmationLog[];
        totalCount: number;
        pageCount: number;
      };
    } catch (error: any) {
      console.error('Erreur récupération logs:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des logs');
    }
  }

  /**
   * Récupère les détails complets d'une confirmation
   */
  async getConfirmationDetails(confirmationId: string): Promise<EmailConfirmationDetails[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_email_confirmation_details', {
          p_confirmation_id: confirmationId,
        });

      if (error) throw error;

      return data as EmailConfirmationDetails[];
    } catch (error: any) {
      console.error('Erreur récupération détails:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des détails');
    }
  }

  /**
   * Récupère les métriques de rate limiting
   */
  async getRateLimitMetrics(hours: number = 24): Promise<RateLimitMetrics> {
    try {
      const { data, error } = await supabase
        .rpc('get_rate_limit_metrics', {
          p_hours: hours,
        });

      if (error) throw error;

      return data as RateLimitMetrics;
    } catch (error: any) {
      console.error('Erreur récupération rate limit:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des métriques de rate limiting');
    }
  }

  /**
   * Force l'expiration d'un token (admin)
   */
  async expireConfirmation(confirmationId: string, reason: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('admin_expire_email_confirmation', {
          p_confirmation_id: confirmationId,
          p_reason: reason,
        });

      if (error) throw error;

      return data as boolean;
    } catch (error: any) {
      console.error('Erreur expiration token:', error);
      throw new Error(error.message || 'Erreur lors de l\'expiration du token');
    }
  }

  /**
   * Réinitialise les tentatives d'un utilisateur (admin)
   */
  async resetUserAttempts(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('admin_reset_user_email_attempts', {
          p_user_id: userId,
        });

      if (error) throw error;

      return data as boolean;
    } catch (error: any) {
      console.error('Erreur reset tentatives:', error);
      throw new Error(error.message || 'Erreur lors de la réinitialisation');
    }
  }

  /**
   * Confirme manuellement un email (admin)
   */
  async manuallyConfirmEmail(userId: string, reason: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('admin_manually_confirm_email', {
          p_user_id: userId,
          p_reason: reason,
        });

      if (error) throw error;

      return data as boolean;
    } catch (error: any) {
      console.error('Erreur confirmation manuelle:', error);
      throw new Error(error.message || 'Erreur lors de la confirmation manuelle');
    }
  }

  /**
   * Obtient les alertes de sécurité récentes
   */
  async getSecurityAlerts(limit: number = 100): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_email_security_alerts', {
          p_limit: limit,
        });

      if (error) throw error;

      return data as SecurityAlert[];
    } catch (error: any) {
      console.error('Erreur récupération alertes:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des alertes');
    }
  }

  /**
   * Lance le nettoyage manuel des tokens expirés
   */
  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_email_confirmations');

      if (error) throw error;

      return { deletedCount: data as number };
    } catch (error: any) {
      console.error('Erreur nettoyage:', error);
      throw new Error(error.message || 'Erreur lors du nettoyage');
    }
  }

  /**
   * Exporte les logs en CSV
   */
  async exportLogs(
    filters: {
      startDate?: string;
      endDate?: string;
      action?: string;
      success?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs(1, 10000, filters); // Max 10k logs
      
      const csvHeaders = [
        'Date',
        'Action',
        'Succès',
        'Email',
        'IP',
        'User Agent',
        'Temps de réponse (ms)',
        'Message d\'erreur',
        'Métadonnées'
      ];

      const csvRows = logs.map(log => [
        new Date(log.created_at).toLocaleString('fr-FR'),
        log.action,
        log.success ? 'Oui' : 'Non',
        '', // Email sera ajouté via une jointure
        log.ip_address || '',
        log.user_agent || '',
        log.response_time_ms?.toString() || '',
        log.error_message || '',
        JSON.stringify(log.metadata || {})
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error: any) {
      console.error('Erreur export CSV:', error);
      throw new Error(error.message || 'Erreur lors de l\'export');
    }
  }

  /**
   * Obtient un résumé des performances par période
   */
  async getPerformanceSummary(period: 'hour' | 'day' | 'week' | 'month' = 'day') {
    try {
      const { data, error } = await supabase
        .rpc('get_email_performance_summary', {
          p_period: period,
        });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Erreur résumé performance:', error);
      throw new Error(error.message || 'Erreur lors de la récupération du résumé');
    }
  }
}

export const emailConfirmationAdminService = new EmailConfirmationAdminService();