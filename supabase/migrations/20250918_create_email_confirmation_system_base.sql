-- Créer la table email_confirmations si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_id ON email_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_token_hash ON email_confirmations(token_hash);

-- Activer RLS
ALTER TABLE email_confirmations ENABLE ROW LEVEL SECURITY;

-- Politique RLS
CREATE POLICY "Users can view their own email confirmations" ON email_confirmations
FOR ALL USING (user_id = auth.uid());