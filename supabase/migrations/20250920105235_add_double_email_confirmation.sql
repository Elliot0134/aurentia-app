-- Ajouter des colonnes pour la double confirmation d'email
ALTER TABLE email_confirmations 
ADD COLUMN IF NOT EXISTS old_email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS new_email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS old_email_token_hash TEXT,
ADD COLUMN IF NOT EXISTS new_email_token_hash TEXT,
ADD COLUMN IF NOT EXISTS confirmation_type TEXT DEFAULT 'double' CHECK (confirmation_type IN ('single', 'double'));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_confirmations_old_token ON email_confirmations(old_email_token_hash);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_new_token ON email_confirmations(new_email_token_hash);
