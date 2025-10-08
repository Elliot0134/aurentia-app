-- Migration: Complete subscription tracking system
-- Date: 2025-10-06
-- Description: Enhances member_subscriptions table and adds tracking functions

-- Ensure member_subscriptions table has all necessary fields
ALTER TABLE public.member_subscriptions
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS last_payment_date date,
ADD COLUMN IF NOT EXISTS next_payment_date date,
ADD COLUMN IF NOT EXISTS amount numeric(10,2),
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled', 'failed')),
ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_invoice_id text;

-- Add computed column for days overdue
ALTER TABLE public.member_subscriptions
ADD COLUMN IF NOT EXISTS days_overdue integer GENERATED ALWAYS AS (
  CASE 
    WHEN payment_status = 'overdue' AND next_payment_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (CURRENT_DATE - next_payment_date))::integer
    ELSE 0
  END
) STORED;

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(user_id uuid, org_id uuid)
RETURNS TABLE (
  is_active boolean,
  payment_status text,
  days_overdue integer,
  last_payment_date date,
  next_payment_date date,
  amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.status = 'active' as is_active,
    ms.payment_status,
    COALESCE(ms.days_overdue, 0) as days_overdue,
    ms.last_payment_date,
    ms.next_payment_date,
    ms.amount
  FROM public.member_subscriptions ms
  WHERE ms.user_id = $1 AND ms.organization_id = $2
  ORDER BY ms.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to update payment status automatically
CREATE OR REPLACE FUNCTION public.update_subscription_payment_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark as overdue if payment date passed
  UPDATE public.member_subscriptions
  SET payment_status = 'overdue'
  WHERE next_payment_date < CURRENT_DATE
    AND payment_status = 'pending'
    AND status = 'active';

  -- Auto-renew subscriptions
  UPDATE public.member_subscriptions
  SET 
    next_payment_date = next_payment_date + INTERVAL '1 month',
    payment_status = 'pending'
  WHERE payment_status = 'paid'
    AND auto_renew = true
    AND next_payment_date <= CURRENT_DATE
    AND status = 'active';
END;
$$;

-- Create function to mark subscription as paid
CREATE OR REPLACE FUNCTION public.mark_subscription_paid(
  p_subscription_id uuid,
  p_payment_date date DEFAULT CURRENT_DATE,
  p_amount numeric DEFAULT NULL,
  p_payment_method text DEFAULT NULL,
  p_stripe_invoice_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.member_subscriptions
  SET 
    payment_status = 'paid',
    last_payment_date = p_payment_date,
    next_payment_date = p_payment_date + INTERVAL '1 month',
    amount = COALESCE(p_amount, amount),
    payment_method = COALESCE(p_payment_method, payment_method),
    stripe_invoice_id = COALESCE(p_stripe_invoice_id, stripe_invoice_id),
    updated_at = now()
  WHERE id = p_subscription_id;

  RETURN FOUND;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_user_org ON public.member_subscriptions(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_status ON public.member_subscriptions(payment_status, status);
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_next_payment ON public.member_subscriptions(next_payment_date) WHERE status = 'active';

-- Add RLS policies if not exist
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.member_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.member_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Organization admins can view member subscriptions
DROP POLICY IF EXISTS "Org admins can view member subscriptions" ON public.member_subscriptions;
CREATE POLICY "Org admins can view member subscriptions"
  ON public.member_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = member_subscriptions.organization_id
        AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- Policy: Organization admins can update member subscriptions
DROP POLICY IF EXISTS "Org admins can update member subscriptions" ON public.member_subscriptions;
CREATE POLICY "Org admins can update member subscriptions"
  ON public.member_subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = member_subscriptions.organization_id
        AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- Policy: Organization admins can insert member subscriptions
DROP POLICY IF EXISTS "Org admins can insert member subscriptions" ON public.member_subscriptions;
CREATE POLICY "Org admins can insert member subscriptions"
  ON public.member_subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = member_subscriptions.organization_id
        AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- Add comments
COMMENT ON FUNCTION public.get_subscription_status IS 'Gets the current subscription status for a user in an organization';
COMMENT ON FUNCTION public.update_subscription_payment_status IS 'Automatically updates subscription payment statuses based on dates';
COMMENT ON FUNCTION public.mark_subscription_paid IS 'Marks a subscription as paid and updates payment details';
