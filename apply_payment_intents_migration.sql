-- Script pour appliquer manuellement la migration payment_intents
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Create billing schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS billing;

-- Create payment_intents table to track payment associations in billing schema
CREATE TABLE IF NOT EXISTS billing.payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_intent_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    stripe_payment_intent_id TEXT, -- ID du payment intent Stripe réel (si différent)
    amount INTEGER, -- Montant en centimes
    currency TEXT DEFAULT 'eur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_payment_intents_payment_intent_id ON billing.payment_intents(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON billing.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_project_id ON billing.payment_intents(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON billing.payment_intents(status);

-- RLS (Row Level Security)
ALTER TABLE billing.payment_intents ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres payment intents
CREATE POLICY "Users can view their own payment intents" ON billing.payment_intents
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leurs propres payment intents
CREATE POLICY "Users can create their own payment intents" ON billing.payment_intents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres payment intents
CREATE POLICY "Users can update their own payment intents" ON billing.payment_intents
    FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON billing.payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_intents_updated_at();

-- Fonction pour récupérer les informations utilisateur depuis un payment_intent_id
CREATE OR REPLACE FUNCTION billing.get_user_from_payment_intent(p_payment_intent_id TEXT)
RETURNS TABLE (
    user_id UUID,
    project_id UUID,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT pi.user_id, pi.project_id, pi.status
    FROM billing.payment_intents pi
    WHERE pi.payment_intent_id = p_payment_intent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer un payment intent comme complété
CREATE OR REPLACE FUNCTION billing.complete_payment_intent(p_payment_intent_id TEXT, p_stripe_payment_intent_id TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE billing.payment_intents 
    SET 
        status = 'completed',
        completed_at = NOW(),
        stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id)
    WHERE payment_intent_id = p_payment_intent_id
    AND status = 'pending';
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;