-- Fonction pour déduire les crédits d'un utilisateur
CREATE OR REPLACE FUNCTION public.deduct_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Vérifier les crédits actuels
  SELECT credits INTO current_credits FROM public.user_credits WHERE user_id = p_user_id;

  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé ou crédits non initialisés.';
  END IF;

  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Crédits insuffisants. Solde actuel: %, requis: %', current_credits, p_amount;
  END IF;

  -- Déduire les crédits
  UPDATE public.user_credits
  SET credits = credits - p_amount, last_updated = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO current_credits; -- Récupérer le nouveau solde

  RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des crédits à un utilisateur
CREATE OR REPLACE FUNCTION public.add_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Ajouter les crédits
  UPDATE public.user_credits
  SET credits = credits + p_amount, last_updated = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO current_credits; -- Récupérer le nouveau solde

  IF current_credits IS NULL THEN
    -- Si l'utilisateur n'existe pas dans user_credits, l'insérer (devrait être géré par le trigger handle_new_user_credits)
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (p_user_id, p_amount)
    RETURNING credits INTO current_credits;
  END IF;

  RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
