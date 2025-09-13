-- Table pour gérer les crédits des utilisateurs
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Fonction pour initialiser les crédits d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 100); -- Donner 100 crédits initiaux aux nouveaux utilisateurs
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction lors de la création d'un nouvel utilisateur
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- RLS pour la table user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own credits" ON public.user_credits
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
