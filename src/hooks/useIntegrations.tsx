/**
 * Integration Hooks
 * React Query hooks for managing integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import type {
  Integration,
  IntegrationWebhook,
  IntegrationApiKey,
  CreateIntegrationInput,
  UpdateIntegrationInput,
  CreateWebhookInput,
  UpdateWebhookInput,
  CreateApiKeyInput,
} from '@/types/integrationTypes';
import { encryptionService } from '@/services/encryptionService';
import { integrationService } from '@/services/integrationService';

// =====================================================
// QUERY KEYS
// =====================================================

const INTEGRATION_KEYS = {
  all: ['integrations'] as const,
  lists: () => [...INTEGRATION_KEYS.all, 'list'] as const,
  list: (userId?: string, orgId?: string) =>
    [...INTEGRATION_KEYS.lists(), { userId, orgId }] as const,
  detail: (id: string) => [...INTEGRATION_KEYS.all, 'detail', id] as const,
  logs: (id: string) => [...INTEGRATION_KEYS.all, 'logs', id] as const,
  stats: (id: string) => [...INTEGRATION_KEYS.all, 'stats', id] as const,
};

const WEBHOOK_KEYS = {
  all: ['integration-webhooks'] as const,
  lists: () => [...WEBHOOK_KEYS.all, 'list'] as const,
  list: (userId?: string, orgId?: string) => [...WEBHOOK_KEYS.lists(), { userId, orgId }] as const,
};

const API_KEY_KEYS = {
  all: ['integration-api-keys'] as const,
  lists: () => [...API_KEY_KEYS.all, 'list'] as const,
  list: (userId?: string, orgId?: string) => [...API_KEY_KEYS.lists(), { userId, orgId }] as const,
};

// =====================================================
// INTEGRATIONS HOOKS
// =====================================================

/**
 * Fetch all integrations for current user/org
 */
export function useIntegrations() {
  const { userProfile, organizationId } = useUser();

  return useQuery({
    queryKey: INTEGRATION_KEYS.list(userProfile?.id, organizationId || undefined),
    queryFn: async () => {
      const query = supabase.from('integrations').select('*').order('created_at', { ascending: false });

      if (organizationId) {
        query.eq('organisation_id', organizationId);
      } else if (userProfile?.id) {
        query.eq('user_id', userProfile.id);
      } else {
        return [];
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useIntegrations] Error fetching integrations:', error);
        throw error;
      }

      return (data || []) as Integration[];
    },
    enabled: !!userProfile?.id,
  });
}

/**
 * Create a new integration
 */
export function useCreateIntegration() {
  const { userProfile, organizationId } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIntegrationInput) => {
      if (!userProfile?.id) {
        throw new Error('User not authenticated');
      }

      // Encrypt credentials
      const encryptedCredentials = encryptionService.encrypt(input.credentials);

      const { data, error } = await supabase
        .from('integrations')
        .insert({
          user_id: organizationId ? null : userProfile.id,
          organisation_id: organizationId || null,
          integration_type: input.integration_type,
          credentials: encryptedCredentials,
          settings: input.settings || {},
          status: 'pending', // Will be updated after test connection
        })
        .select()
        .single();

      if (error) throw error;

      return data as Integration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.lists() });
    },
  });
}

/**
 * Update an integration
 */
export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIntegrationInput }) => {
      const updateData: any = {};

      if (data.credentials) {
        updateData.credentials = encryptionService.encrypt(data.credentials);
      }

      if (data.settings) {
        updateData.settings = data.settings;
      }

      if (data.status) {
        updateData.status = data.status;
      }

      updateData.updated_at = new Date().toISOString();

      const { data: result, error } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return result as Integration;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.detail(variables.id) });
    },
  });
}

/**
 * Delete an integration
 */
export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('integrations').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.lists() });
      toast({
        title: 'Intégration supprimée',
        description: 'L\'intégration a été supprimée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'intégration',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test integration connection
 */
export function useTestIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      return await integrationService.testConnection(integrationId);
    },
    onSuccess: (result, integrationId) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.detail(integrationId) });
        queryClient.invalidateQueries({ queryKey: INTEGRATION_KEYS.lists() });
      }
    },
  });
}

// =====================================================
// WEBHOOKS HOOKS
// =====================================================

/**
 * Fetch all webhooks for current user/org
 */
export function useIntegrationWebhooks() {
  const { userProfile, organizationId } = useUser();

  return useQuery({
    queryKey: WEBHOOK_KEYS.list(userProfile?.id, organizationId || undefined),
    queryFn: async () => {
      const query = supabase.from('integration_webhooks').select('*').order('created_at', { ascending: false });

      if (organizationId) {
        query.eq('organisation_id', organizationId);
      } else if (userProfile?.id) {
        query.eq('user_id', userProfile.id);
      } else {
        return [];
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as IntegrationWebhook[];
    },
    enabled: !!userProfile?.id,
  });
}

/**
 * Create a new webhook
 */
export function useCreateWebhook() {
  const { userProfile, organizationId } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWebhookInput) => {
      if (!userProfile?.id) {
        throw new Error('User not authenticated');
      }

      // Generate secret if not provided
      const secret = input.secret || encryptionService.generateWebhookSecret();

      const { data, error } = await supabase
        .from('integration_webhooks')
        .insert({
          user_id: organizationId ? null : userProfile.id,
          organisation_id: organizationId || null,
          name: input.name,
          url: input.url,
          events: input.events || [],
          secret,
          active: input.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      return data as IntegrationWebhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
      toast({
        title: 'Webhook créé',
        description: 'Le webhook a été créé avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le webhook',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update a webhook
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebhookInput }) => {
      const { data: result, error } = await supabase
        .from('integration_webhooks')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return result as IntegrationWebhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
    },
  });
}

/**
 * Delete a webhook
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('integration_webhooks').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
      toast({
        title: 'Webhook supprimé',
        description: 'Le webhook a été supprimé avec succès',
      });
    },
  });
}

// =====================================================
// API KEYS HOOKS
// =====================================================

/**
 * Fetch all API keys for current user/org
 */
export function useIntegrationApiKeys() {
  const { userProfile, organizationId } = useUser();

  return useQuery({
    queryKey: API_KEY_KEYS.list(userProfile?.id, organizationId || undefined),
    queryFn: async () => {
      const query = supabase
        .from('integration_api_keys')
        .select('*')
        .eq('revoked', false)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query.eq('organisation_id', organizationId);
      } else if (userProfile?.id) {
        query.eq('user_id', userProfile.id);
      } else {
        return [];
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as IntegrationApiKey[];
    },
    enabled: !!userProfile?.id,
  });
}

/**
 * Create a new API key
 */
export function useCreateApiKey() {
  const { userProfile, organizationId } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      if (!userProfile?.id) {
        throw new Error('User not authenticated');
      }

      // Generate API key
      const { key, prefix } = encryptionService.generateApiKey(input.scope);
      const keyHash = await encryptionService.hashApiKey(key);

      const { data, error } = await supabase
        .from('integration_api_keys')
        .insert({
          user_id: organizationId ? null : userProfile.id,
          organisation_id: organizationId || null,
          name: input.name,
          key_hash: keyHash,
          key_prefix: prefix,
          scope: input.scope,
          permissions: input.permissions || { read: true, write: false },
          rate_limit: input.rate_limit || 1000,
          expires_at: input.expires_at || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Return both the database record and the actual key (only shown once)
      return { apiKey: data as IntegrationApiKey, key };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEY_KEYS.lists() });
    },
  });
}

/**
 * Revoke an API key
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integration_api_keys')
        .update({ revoked: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEY_KEYS.lists() });
      toast({
        title: 'Clé révoquée',
        description: 'La clé API a été révoquée avec succès',
      });
    },
  });
}
