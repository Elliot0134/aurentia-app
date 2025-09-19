-- Migration pour le système de confirmation d'email
-- Date: 2025-09-18
-- Description: Création des tables pour la confirmation d'email avec tokens sécurisés

-- Activer l'extension pour les UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table principale pour les confirmations d'email
CREATE TABLE IF NOT EXISTS email_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE, -- Hash sécurisé du token
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'failed', 'cancelled')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les logs d'audit
CREATE TABLE IF NOT EXISTS email_confirmation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_id UUID REFERENCES email_confirmations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('sent', 'clicked', 'confirmed', 'failed', 'resent', 'expired', 'cancelled')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_email_confirmations_token_hash ON email_confirmations(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_id ON email_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_expires_at ON email_confirmations(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_status ON email_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_created_at ON email_confirmations(created_at);

CREATE INDEX IF NOT EXISTS idx_email_confirmation_logs_confirmation_id ON email_confirmation_logs(confirmation_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_logs_user_id ON email_confirmation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_logs_action ON email_confirmation_logs(action);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_logs_created_at ON email_confirmation_logs(created_at);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_email_confirmation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_email_confirmation_updated_at ON email_confirmations;
CREATE TRIGGER trigger_update_email_confirmation_updated_at
    BEFORE UPDATE ON email_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION update_email_confirmation_updated_at();

-- Fonction pour nettoyer les tokens expirés (appellée par cron)
CREATE OR REPLACE FUNCTION cleanup_expired_email_confirmations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Marquer comme expirés les tokens dépassés
    UPDATE email_confirmations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Supprimer les anciens tokens expirés (> 30 jours)
    DELETE FROM email_confirmations 
    WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '30 days';
    
    -- Log du nettoyage
    INSERT INTO email_confirmation_logs (
        confirmation_id,
        action,
        success,
        metadata,
        created_at
    ) VALUES (
        NULL,
        'cleanup',
        true,
        jsonb_build_object(
            'expired_tokens_marked', deleted_count,
            'cleanup_date', NOW()
        ),
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier le rate limiting
CREATE OR REPLACE FUNCTION check_email_confirmation_rate_limit(
    p_email TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    email_count INTEGER;
    ip_count INTEGER;
    user_count INTEGER;
    result JSONB;
BEGIN
    -- Vérifier le rate limit par email (max 10 par heure)
    SELECT COUNT(*) INTO email_count
    FROM email_confirmations 
    WHERE email = p_email 
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Vérifier le rate limit par IP (max 15 par heure)
    IF p_ip_address IS NOT NULL THEN
        SELECT COUNT(*) INTO ip_count
        FROM email_confirmations 
        WHERE ip_address = p_ip_address 
        AND created_at > NOW() - INTERVAL '1 hour';
    ELSE
        ip_count := 0;
    END IF;
    
    -- Vérifier le rate limit par utilisateur (max 5 par heure)
    IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO user_count
        FROM email_confirmations 
        WHERE user_id = p_user_id 
        AND created_at > NOW() - INTERVAL '1 hour';
    ELSE
        user_count := 0;
    END IF;
    
    result := jsonb_build_object(
        'allowed', (email_count < 10 AND ip_count < 15 AND user_count < 5),
        'email_count', email_count,
        'email_limit', 10,
        'ip_count', ip_count,
        'ip_limit', 15,
        'user_count', user_count,
        'user_limit', 5
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE email_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_confirmation_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres confirmations
CREATE POLICY "Users can view own email confirmations" ON email_confirmations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email confirmations" ON email_confirmations
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les logs (lecture seule pour les utilisateurs)
CREATE POLICY "Users can view own email confirmation logs" ON email_confirmation_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour les services (insertion depuis les edge functions)
CREATE POLICY "Service can insert email confirmations" ON email_confirmations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert email confirmation logs" ON email_confirmation_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update email confirmations" ON email_confirmations
    FOR UPDATE USING (true);

-- Activer Realtime pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE email_confirmations;

-- Ajouter une colonne à la table profiles pour tracker le statut de confirmation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_confirmed_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_confirmation_required'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email_confirmation_required BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Fonction pour récupérer le statut de confirmation d'un utilisateur
CREATE OR REPLACE FUNCTION get_email_confirmation_status(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT to_json(ec.*) INTO result
    FROM email_confirmations ec
    WHERE ec.user_id = p_user_id
    AND ec.status = 'pending'
    ORDER BY ec.created_at DESC
    LIMIT 1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a besoin de confirmer son email
CREATE OR REPLACE FUNCTION check_email_confirmation_needed(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    needs_confirmation BOOLEAN DEFAULT true;
    user_profile RECORD;
BEGIN
    -- Récupérer le profil utilisateur
    SELECT email_confirmation_required, email_confirmed_at
    INTO user_profile
    FROM profiles
    WHERE id = p_user_id;
    
    -- Si le profil n'existe pas, considérer que confirmation est nécessaire
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Si email_confirmation_required est false, pas besoin
    IF user_profile.email_confirmation_required = false THEN
        RETURN false;
    END IF;
    
    -- Si déjà confirmé, pas besoin
    IF user_profile.email_confirmed_at IS NOT NULL THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour annuler une confirmation d'email
CREATE OR REPLACE FUNCTION cancel_email_confirmation(p_confirmation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE email_confirmations
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_confirmation_id
    AND status = 'pending';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Logger l'action
    IF updated_count > 0 THEN
        INSERT INTO email_confirmation_logs (
            confirmation_id,
            action,
            success,
            metadata,
            created_at
        ) VALUES (
            p_confirmation_id,
            'cancelled',
            true,
            jsonb_build_object('cancelled_by_function', true),
            NOW()
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonctions d'administration et de reporting

-- Fonction pour obtenir les métriques de confirmation d'email
CREATE OR REPLACE FUNCTION get_email_confirmation_metrics(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_sent INTEGER;
    total_confirmed INTEGER;
    total_expired INTEGER;
    total_failed INTEGER;
    avg_confirmation_time NUMERIC;
    date_filter TEXT DEFAULT '';
BEGIN
    -- Construire le filtre de date si nécessaire
    IF p_start_date IS NOT NULL THEN
        date_filter := ' AND created_at >= ''' || p_start_date || '''';
    END IF;
    IF p_end_date IS NOT NULL THEN
        date_filter := date_filter || ' AND created_at <= ''' || p_end_date || '''';
    END IF;

    -- Calculer les métriques
    EXECUTE 'SELECT COUNT(*) FROM email_confirmations WHERE 1=1' || date_filter INTO total_sent;
    EXECUTE 'SELECT COUNT(*) FROM email_confirmations WHERE status = ''confirmed''' || date_filter INTO total_confirmed;
    EXECUTE 'SELECT COUNT(*) FROM email_confirmations WHERE status = ''expired''' || date_filter INTO total_expired;
    EXECUTE 'SELECT COUNT(*) FROM email_confirmations WHERE status = ''failed''' || date_filter INTO total_failed;
    
    -- Temps moyen de confirmation (en minutes)
    SELECT AVG(EXTRACT(EPOCH FROM (confirmed_at - created_at)) / 60)
    INTO avg_confirmation_time
    FROM email_confirmations
    WHERE status = 'confirmed' AND confirmed_at IS NOT NULL;

    result := json_build_object(
        'totalSent', total_sent,
        'totalConfirmed', total_confirmed,
        'totalExpired', total_expired,
        'totalFailed', total_failed,
        'confirmationRate', CASE WHEN total_sent > 0 THEN (total_confirmed::NUMERIC / total_sent * 100) ELSE 0 END,
        'averageConfirmationTime', COALESCE(avg_confirmation_time, 0),
        'recentActivity', json_build_object(
            'last24h', (SELECT COUNT(*) FROM email_confirmations WHERE created_at > NOW() - INTERVAL '24 hours'),
            'last7days', (SELECT COUNT(*) FROM email_confirmations WHERE created_at > NOW() - INTERVAL '7 days'),
            'last30days', (SELECT COUNT(*) FROM email_confirmations WHERE created_at > NOW() - INTERVAL '30 days')
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les logs paginés
CREATE OR REPLACE FUNCTION get_email_confirmation_logs_paginated(
    p_page INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 50,
    p_action TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    logs JSON;
    offset_val INTEGER;
BEGIN
    offset_val := (p_page - 1) * p_page_size;
    
    -- Compter le total
    SELECT COUNT(*) INTO total_count
    FROM email_confirmation_logs ecl
    LEFT JOIN email_confirmations ec ON ecl.confirmation_id = ec.id
    WHERE (p_action IS NULL OR ecl.action = p_action)
    AND (p_success IS NULL OR ecl.success = p_success)
    AND (p_user_id IS NULL OR ecl.user_id = p_user_id)
    AND (p_email IS NULL OR ec.email ILIKE '%' || p_email || '%')
    AND (p_start_date IS NULL OR ecl.created_at >= p_start_date)
    AND (p_end_date IS NULL OR ecl.created_at <= p_end_date);
    
    -- Récupérer les logs
    SELECT json_agg(
        json_build_object(
            'id', ecl.id,
            'confirmation_id', ecl.confirmation_id,
            'user_id', ecl.user_id,
            'action', ecl.action,
            'ip_address', ecl.ip_address,
            'user_agent', ecl.user_agent,
            'success', ecl.success,
            'error_message', ecl.error_message,
            'response_time_ms', ecl.response_time_ms,
            'metadata', ecl.metadata,
            'created_at', ecl.created_at,
            'email', ec.email
        )
    ) INTO logs
    FROM email_confirmation_logs ecl
    LEFT JOIN email_confirmations ec ON ecl.confirmation_id = ec.id
    WHERE (p_action IS NULL OR ecl.action = p_action)
    AND (p_success IS NULL OR ecl.success = p_success)
    AND (p_user_id IS NULL OR ecl.user_id = p_user_id)
    AND (p_email IS NULL OR ec.email ILIKE '%' || p_email || '%')
    AND (p_start_date IS NULL OR ecl.created_at >= p_start_date)
    AND (p_end_date IS NULL OR ecl.created_at <= p_end_date)
    ORDER BY ecl.created_at DESC
    LIMIT p_page_size OFFSET offset_val;
    
    result := json_build_object(
        'logs', COALESCE(logs, '[]'::json),
        'totalCount', total_count,
        'pageCount', CEIL(total_count::NUMERIC / p_page_size)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction admin pour expirer manuellement une confirmation
CREATE OR REPLACE FUNCTION admin_expire_email_confirmation(
    p_confirmation_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE email_confirmations
    SET status = 'expired', updated_at = NOW()
    WHERE id = p_confirmation_id
    AND status IN ('pending', 'failed');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        INSERT INTO email_confirmation_logs (
            confirmation_id,
            action,
            success,
            metadata,
            created_at
        ) VALUES (
            p_confirmation_id,
            'expired',
            true,
            jsonb_build_object(
                'expired_by_admin', true,
                'reason', p_reason,
                'admin_user_id', auth.uid()
            ),
            NOW()
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction admin pour confirmer manuellement un email
CREATE OR REPLACE FUNCTION admin_manually_confirm_email(
    p_user_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    confirmation_record RECORD;
    updated_count INTEGER;
BEGIN
    -- Trouver la confirmation en attente
    SELECT * INTO confirmation_record
    FROM email_confirmations
    WHERE user_id = p_user_id
    AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Marquer comme confirmé
    UPDATE email_confirmations
    SET status = 'confirmed',
        confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = confirmation_record.id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        -- Mettre à jour le profil
        UPDATE profiles
        SET email_confirmed_at = NOW(),
            email_confirmation_required = false
        WHERE id = p_user_id;
        
        -- Logger l'action
        INSERT INTO email_confirmation_logs (
            confirmation_id,
            user_id,
            action,
            success,
            metadata,
            created_at
        ) VALUES (
            confirmation_record.id,
            p_user_id,
            'confirmed',
            true,
            jsonb_build_object(
                'confirmed_by_admin', true,
                'reason', p_reason,
                'admin_user_id', auth.uid()
            ),
            NOW()
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Programmer le nettoyage automatique (si pg_cron est disponible)
-- SELECT cron.schedule('cleanup-expired-email-confirmations', '0 2 * * *', 'SELECT cleanup_expired_email_confirmations();');

-- Commentaire final
COMMENT ON TABLE email_confirmations IS 'Table pour gérer les confirmations d''email avec tokens sécurisés';
COMMENT ON TABLE email_confirmation_logs IS 'Logs d''audit pour tracer toutes les actions de confirmation d''email';