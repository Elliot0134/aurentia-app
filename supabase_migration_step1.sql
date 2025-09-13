BEGIN;

CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing')) DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

CREATE TABLE billing.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_credits INTEGER NOT NULL DEFAULT 0 CHECK (monthly_credits >= 0),
  purchased_credits INTEGER NOT NULL DEFAULT 0 CHECK (purchased_credits >= 0),
  first_premium_used BOOLEAN DEFAULT false,
  credits_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE billing.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription_monthly', 'purchase', 'spend_premium', 'spend_tool', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('monthly', 'purchased', 'mixed')),
  balance_after_monthly INTEGER NOT NULL,
  balance_after_purchased INTEGER NOT NULL,
  description TEXT,
  project_id UUID,
  stripe_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE billing.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subscription', 'tools', 'packages', 'premium')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE billing.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  stripe_payment_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON billing.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON billing.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON billing.subscriptions(status);
CREATE INDEX idx_user_credits_user_id ON billing.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON billing.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON billing.credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_type ON billing.credit_transactions(type);

INSERT INTO billing.pricing_config (key, value, category, description) VALUES
('credits_per_month', 1500, 'subscription', 'Crédits mensuels avec abonnement'),
('subscription_price_cents', 1290, 'subscription', 'Prix abonnement en centimes'),
('premium_business_plan', 750, 'premium', 'Coût Business Plan en crédits'),
('premium_market_study', 1000, 'premium', 'Coût étude de marché en crédits'),
('premium_competition_analysis', 750, 'premium', 'Coût analyse concurrence en crédits'),
('premium_value_proposition', 750, 'premium', 'Coût proposition de valeur en crédits'),
('premium_resources_analysis', 750, 'premium', 'Coût analyse ressources en crédits'),
('tool_instagram_simple', 50, 'tools', 'Post Instagram simple'),
('tool_blog_article', 200, 'tools', 'Article de blog'),
('tool_newsletter', 250, 'tools', 'Newsletter'),
('pack_10_credits', 3000, 'packages', 'Crédits pour pack 10€'),
('pack_20_credits', 7000, 'packages', 'Crédits pour pack 20€'),
('pack_50_credits', 20000, 'packages', 'Crédits pour pack 50€');

INSERT INTO billing.credit_packages (name, credits, price_cents, is_active) VALUES
('Pack Starter', 3000, 1000, true),
('Pack Pro', 7000, 2000, true),
('Pack Expert', 20000, 5000, true);

INSERT INTO billing.user_credits (user_id, monthly_credits, purchased_credits, first_premium_used)
SELECT 
  id,
  CASE 
    WHEN credits_restants ~ '^[0-9]+$' THEN CAST(credits_restants AS INTEGER)
    ELSE 0 
  END as monthly_credits,
  0 as purchased_credits,
  false as first_premium_used
FROM public.profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  monthly_credits = EXCLUDED.monthly_credits,
  updated_at = now();

INSERT INTO billing.credit_transactions (
  user_id, type, amount, credit_type, 
  balance_after_monthly, balance_after_purchased, 
  description
)
SELECT 
  uc.user_id,
  'subscription_monthly',
  uc.monthly_credits,
  'monthly',
  uc.monthly_credits,
  0,
  'Migration des crédits existants'
FROM billing.user_credits uc
WHERE uc.monthly_credits > 0;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

UPDATE public.project_summary 
SET statut_project = 'free' 
WHERE statut_project IN ('pay_1_waiting', 'pay_2_waiting', 'plan1', 'plan2');

COMMIT;