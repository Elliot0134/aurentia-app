import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  is_active: boolean;
  payment_status: string;
  days_overdue: number;
  last_payment_date?: string;
  next_payment_date?: string;
  amount?: number;
}

export interface CreateSubscriptionData {
  user_id: string;
  organization_id: string;
  subscription_type: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  auto_renew?: boolean;
  start_date?: string;
}

/**
 * Get subscription status for a user in an organization
 */
export const getSubscriptionStatus = async (
  userId: string,
  organizationId: string
): Promise<SubscriptionStatus | null> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_subscription_status', {
      user_id: userId,
      org_id: organizationId
    });

    if (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    return null;
  }
};

/**
 * Create a new subscription for a user
 */
export const createSubscription = async (
  subscriptionData: CreateSubscriptionData
): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('member_subscriptions')
      .insert({
        user_id: subscriptionData.user_id,
        organization_id: subscriptionData.organization_id,
        subscription_type: subscriptionData.subscription_type,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'EUR',
        payment_method: subscriptionData.payment_method,
        auto_renew: subscriptionData.auto_renew ?? true,
        status: 'active',
        payment_status: 'pending',
        start_date: subscriptionData.start_date || new Date().toISOString(),
        next_payment_date: subscriptionData.start_date 
          ? new Date(new Date(subscriptionData.start_date).setMonth(new Date(subscriptionData.start_date).getMonth() + 1)).toISOString()
          : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      });

    if (error) {
      console.error('Error creating subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createSubscription:', error);
    return false;
  }
};

/**
 * Mark a subscription as paid
 */
export const markSubscriptionPaid = async (
  subscriptionId: string,
  paymentDate?: string,
  amount?: number,
  paymentMethod?: string,
  stripeInvoiceId?: string
): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any).rpc('mark_subscription_paid', {
      p_subscription_id: subscriptionId,
      p_payment_date: paymentDate || new Date().toISOString(),
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_stripe_invoice_id: stripeInvoiceId
    });

    if (error) {
      console.error('Error marking subscription as paid:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in markSubscriptionPaid:', error);
    return false;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('member_subscriptions')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    return false;
  }
};

/**
 * Get all subscriptions for an organization
 */
export const getOrganizationSubscriptions = async (
  organizationId: string
): Promise<any[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('member_subscriptions')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrganizationSubscriptions:', error);
    return [];
  }
};

/**
 * Update subscription payment status automatically (should be run periodically)
 */
export const updateSubscriptionPaymentStatuses = async (): Promise<boolean> => {
  try {
    const { error } = await (supabase as any).rpc('update_subscription_payment_status');

    if (error) {
      console.error('Error updating subscription payment statuses:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSubscriptionPaymentStatuses:', error);
    return false;
  }
};
