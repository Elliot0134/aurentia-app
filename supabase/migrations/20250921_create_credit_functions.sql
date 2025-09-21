-- supabase/migrations/20250921_create_credit_functions.sql

-- 1. Fonction pour récupérer les crédits d'un utilisateur
-- Cette fonction est SECURITY DEFINER pour pouvoir accéder au schéma `billing`
-- en toute sécurité depuis le client.
-- Modifié pour retourner JSON, ce qui est plus robuste avec PostgREST.
create or replace function public.get_user_credits(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = billing, public
as $$
declare
  credits_data json;
begin
  select
    json_build_object(
      'monthly_credits_remaining', b.monthly_credits_remaining,
      'purchased_credits_remaining', b.purchased_credits_remaining,
      'monthly_credits_limit', b.monthly_credits_limit
    )
  into credits_data
  from billing.user_credits as b
  where b.user_id = p_user_id;

  return coalesce(credits_data, '{}'::json);
end;
$$;

-- 2. Fonction pour initialiser les crédits d'un utilisateur s'ils n'existent pas
create or replace function public.initialize_user_credits_if_not_exists(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = billing, public
as $$
begin
  if not exists (select 1 from billing.user_credits where user_id = p_user_id) then
    insert into billing.user_credits(user_id, monthly_credits_remaining, purchased_credits_remaining, monthly_credits_limit)
    values(p_user_id, 1500, 0, 1500); -- Valeurs par défaut pour un nouvel utilisateur
  end if;
end;
$$;


-- 3. Fonction pour réinitialiser les crédits mensuels si le cycle de facturation est passé
-- Note: Cette fonction est un exemple. La logique de `billing_cycle_start` doit être adaptée
-- à votre système de facturation réel.
create or replace function public.reset_credits_if_needed(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = billing, public
as $$
declare
  last_reset timestamp;
  current_cycle_start timestamp;
begin
  -- Récupérer la date de dernier reset
  select last_credit_reset into last_reset from billing.user_credits where user_id = p_user_id;

  -- Logique de cycle simplifiée: on reset si le dernier reset date de plus de 30 jours
  -- Pour un vrai système, il faudrait se baser sur la date d'abonnement Stripe.
  if last_reset is null or last_reset < (now() - interval '30 days') then
    update billing.user_credits
    set
      monthly_credits_remaining = monthly_credits_limit,
      last_credit_reset = now()
    where user_id = p_user_id;
  end if;
end;
$$;

-- Grant permissions to the authenticated role
grant execute on function public.get_user_credits(uuid) to authenticated;
grant execute on function public.initialize_user_credits_if_not_exists(uuid) to authenticated;
grant execute on function public.reset_credits_if_needed(uuid) to authenticated;
