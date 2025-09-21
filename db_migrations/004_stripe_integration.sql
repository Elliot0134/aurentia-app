-- Script SQL pour créer les tables nécessaires à l'intégration Stripe

-- Table pour stocker les clients Stripe
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_customer_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table pour stocker les abonnements Stripe
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    price_id TEXT NOT NULL,
    status TEXT NOT NULL, -- active, canceled, incomplete, etc.
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (stripe_customer_id) REFERENCES stripe_customers(stripe_customer_id)
);

-- Table pour stocker les intentions d'abonnement (tracking du processus)
CREATE TABLE IF NOT EXISTS subscription_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    stripe_customer_id TEXT,
    product_id TEXT NOT NULL,
    price_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, canceled
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les événements webhook Stripe (pour debugging)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_intents_user_id ON subscription_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_intents_project_id ON subscription_intents(project_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- Politiques RLS (Row Level Security)
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Politique pour stripe_customers
CREATE POLICY "Users can view their own stripe customer data" ON stripe_customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stripe customer data" ON stripe_customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour stripe_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON stripe_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour subscription_intents
CREATE POLICY "Users can view their own subscription intents" ON subscription_intents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription intents" ON subscription_intents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription intents" ON subscription_intents
    FOR UPDATE USING (auth.uid() = user_id);

-- Fonctions utilitaires pour l'abonnement

-- Fonction pour vérifier si un utilisateur a un abonnement actif
CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id TEXT,
    status TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.stripe_subscription_id,
        ss.status,
        ss.current_period_start,
        ss.current_period_end,
        ss.cancel_at_period_end
    FROM stripe_subscriptions ss
    WHERE ss.user_id = p_user_id 
    AND ss.status = 'active'
    AND ss.product_id = 'prod_SyRjQAbqp3Qlv5' -- Abonnement Entrepreneur
    ORDER BY ss.created_at DESC
    LIMIT 1;
END;
$$;

-- Fonction pour mettre à jour le statut d'abonnement
CREATE OR REPLACE FUNCTION update_subscription_status(
    p_stripe_subscription_id TEXT,
    p_status TEXT,
    p_current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_cancel_at_period_end BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE stripe_subscriptions
    SET 
        status = p_status,
        current_period_start = COALESCE(p_current_period_start, current_period_start),
        current_period_end = COALESCE(p_current_period_end, current_period_end),
        cancel_at_period_end = COALESCE(p_cancel_at_period_end, cancel_at_period_end),
        updated_at = NOW()
    WHERE stripe_subscription_id = p_stripe_subscription_id;
    
    RETURN FOUND;
END;
$$;

-- Fonction pour traiter un paiement d'abonnement réussi
CREATE OR REPLACE FUNCTION process_subscription_payment_success(
    p_stripe_subscription_id TEXT,
    p_invoice_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_subscription_record RECORD;
BEGIN
    -- Récupérer les informations de l'abonnement
    SELECT user_id INTO v_user_id
    FROM stripe_subscriptions
    WHERE stripe_subscription_id = p_stripe_subscription_id;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Abonnement non trouvé: %', p_stripe_subscription_id;
        RETURN FALSE;
    END IF;
    
    -- Ajouter les crédits mensuels (1500 crédits pour l'abonnement Entrepreneur)
    INSERT INTO billing.user_credits (user_id, amount, credit_type, description, stripe_reference)
    VALUES (
        v_user_id,
        1500,
        'monthly',
        'Crédits mensuels abonnement Entrepreneur',
        COALESCE(p_invoice_id, p_stripe_subscription_id)
    );
    
    -- Mettre à jour le statut d'abonnement dans le profil utilisateur
    UPDATE profiles 
    SET 
        subscription_status = 'active',
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Crédits ajoutés pour l''utilisateur: %', v_user_id;
    RETURN TRUE;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors du traitement du paiement: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_intents_updated_at
    BEFORE UPDATE ON subscription_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
