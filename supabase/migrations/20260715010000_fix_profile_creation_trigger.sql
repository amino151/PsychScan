-- =============================================================================
-- PsychoScan IOS — Correctif : création automatique du profil à l'inscription
-- -----------------------------------------------------------------------------
-- PROBLÈME CORRIGÉ :
--   « new row violates row-level security policy for table "profiles" »
--
-- CAUSE RACINE :
--   Le client faisait un INSERT/UPSERT dans `public.profiles` juste après
--   `supabase.auth.signUp(...)`. Or, si la confirmation d'email est activée
--   (comportement par défaut d'un projet Supabase), `signUp` ne crée PAS de
--   session : `auth.uid()` vaut alors NULL au moment de l'INSERT, et la policy
--   RLS `WITH CHECK (id = auth.uid() ...)` échoue → erreur ci-dessus.
--
-- CORRECTIF (sans jamais désactiver le RLS) :
--   Le profil est créé côté serveur par un trigger `AFTER INSERT ON auth.users`
--   exécuté en `SECURITY DEFINER` (fonction `public.handle_new_user`), qui
--   contourne proprement le RLS. Fonctionne que la confirmation d'email soit
--   activée ou non. Le rôle est TOUJOURS forcé à 'employee' pour éviter toute
--   élévation de privilèges via les métadonnées fournies par le client ; la
--   promotion (manager / hr_admin / super_admin) se fait par un admin via UPDATE.
--
-- -----------------------------------------------------------------------------
-- COMMENT APPLIQUER (Supabase) :
--   1. Dashboard Supabase → SQL Editor → New query.
--   2. Coller l'intégralité de ce fichier et cliquer « Run ». Idempotent :
--      réexécutable sans risque (CREATE OR REPLACE / DROP TRIGGER IF EXISTS).
--   3. Authentication → Providers → Email : vérifier le paramètre
--      « Confirm email ».
--        - ACTIVÉ  : l'utilisateur doit confirmer son email avant de pouvoir se
--          connecter ; le profil est quand même créé immédiatement par le
--          trigger. L'UI affiche « vérifiez votre boîte mail ».
--        - DÉSACTIVÉ : l'inscription connecte directement l'utilisateur.
--      Dans les deux cas l'inscription fonctionne désormais.
--   4. (Optionnel) Ré-appliquer aux comptes déjà créés sans profil :
--        INSERT INTO public.profiles (id, email, full_name, role)
--        SELECT u.id, u.email,
--               COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)),
--               'employee'
--        FROM auth.users u
--        LEFT JOIN public.profiles p ON p.id = u.id
--        WHERE p.id IS NULL;
-- =============================================================================

-- --- Fonction de création de profil (SECURITY DEFINER, search_path sûr) -------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_department_id uuid;
BEGIN
  -- department_id est sans impact sur les privilèges : on l'accepte s'il est
  -- fourni dans les métadonnées et qu'il correspond à un département existant.
  BEGIN
    v_department_id := NULLIF(NEW.raw_user_meta_data->>'department_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_department_id := NULL;
  END;

  IF v_department_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.departments d WHERE d.id = v_department_id) THEN
    v_department_id := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, department_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    'employee',            -- rôle sécurisé par défaut (pas d'élévation via metadata)
    v_department_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- --- Trigger sur auth.users --------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --- Garanties RLS (rappel : le RLS reste ACTIVÉ) ----------------------------
-- Le RLS est déjà activé par la migration de schéma. On (re)crée uniquement la
-- policy INSERT pour rester tolérant au fallback client best-effort (upsert
-- exécuté uniquement lorsqu'une session existe déjà).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_hr_or_admin());
