-- =============================================================================
-- PsychoScan IOS — Schéma normalisé (plateforme RH d'évaluation, centre d'appels)
-- =============================================================================
-- ÉTAPES SUPABASE :
--   1. Dashboard Supabase → SQL Editor → exécuter ce fichier une fois.
--   2. Exécuter ensuite `supabase/seed.sql` pour les données de référence
--      (départements, questionnaires, questions, profils, paramètres).
--   3. Authentication → URL configuration → ajouter http://localhost:5173
--      (et l'URL de production).
--   4. Créer le compte super admin dans Authentication → Users, puis mettre à
--      jour la ligne correspondante dans public.profiles (role = 'super_admin').
--      Un profil est créé automatiquement à l'inscription via le trigger ci-dessous.
--   5. Renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY dans .env.
-- =============================================================================

-- --- Types -------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('employee', 'manager', 'hr_admin', 'super_admin');
  END IF;
END$$;

-- --- Tables ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#2563EB',
  questionnaire_id text,
  key_skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  role public.user_role NOT NULL DEFAULT 'employee',
  department_id uuid REFERENCES public.departments (id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  position text,
  hire_date date,
  avatar_color text DEFAULT '#2563EB',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles (department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_manager ON public.profiles (manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

CREATE TABLE IF NOT EXISTS public.question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  "order" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments (id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_questionnaires_department ON public.questionnaires (department_id);

CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES public.questionnaires (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.question_categories (id) ON DELETE SET NULL,
  category text,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'scale', 'yes_no', 'situation')),
  text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  "order" integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire ON public.questions (questionnaire_id);

CREATE TABLE IF NOT EXISTS public.psychological_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_careers jsonb NOT NULL DEFAULT '[]'::jsonb,
  advice jsonb NOT NULL DEFAULT '[]'::jsonb,
  dominant_traits jsonb NOT NULL DEFAULT '{}'::jsonb,
  color text DEFAULT '#2563EB',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  questionnaire_id uuid REFERENCES public.questionnaires (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz,
  completed_at timestamptz,
  result_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON public.assessment_assignments (employee_id);

CREATE TABLE IF NOT EXISTS public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assessment_assignments (id) ON DELETE SET NULL,
  questionnaire_id uuid REFERENCES public.questionnaires (id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments (id) ON DELETE SET NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_code text,
  profile_name text,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completion_time_seconds integer,
  department_fit integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_results_employee ON public.assessment_results (employee_id);
CREATE INDEX IF NOT EXISTS idx_results_department ON public.assessment_results (department_id);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  result_id uuid REFERENCES public.assessment_results (id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'development' CHECK (type IN ('training', 'career', 'development')),
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recommendations_employee ON public.recommendations (employee_id);

CREATE TABLE IF NOT EXISTS public.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  skill text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done', 'cancelled')),
  start_date timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_training_employee ON public.training_plans (employee_id);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  label text
);

-- --- Fonctions utilitaires (SECURITY DEFINER pour éviter la récursion RLS) ---
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role::text FROM public.profiles WHERE id = auth.uid()), 'employee');
$$;

CREATE OR REPLACE FUNCTION public.current_user_department()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_hr_or_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT public.current_user_role() IN ('hr_admin', 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT public.current_user_role() = 'super_admin';
$$;

-- Création automatique d'un profil à l'inscription.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --- Row Level Security ------------------------------------------------------
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Référentiels : lecture pour tous les authentifiés, écriture RH/admin.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments','question_categories','questionnaires','questions','psychological_profiles'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_read" ON public.%1$s;', t);
    EXECUTE format('CREATE POLICY "%1$s_read" ON public.%1$s FOR SELECT TO authenticated USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_write" ON public.%1$s;', t);
    EXECUTE format('CREATE POLICY "%1$s_write" ON public.%1$s FOR ALL TO authenticated USING (public.is_hr_or_admin()) WITH CHECK (public.is_hr_or_admin());', t);
  END LOOP;
END$$;

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_hr_or_admin()
    OR manager_id = auth.uid()
    OR (public.current_user_role() = 'manager' AND department_id = public.current_user_department())
  );
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_hr_or_admin());
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_hr_or_admin())
  WITH CHECK (id = auth.uid() OR public.is_hr_or_admin());
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_hr_or_admin());

-- assessment_assignments
DROP POLICY IF EXISTS "assignments_select" ON public.assessment_assignments;
CREATE POLICY "assignments_select" ON public.assessment_assignments FOR SELECT TO authenticated
  USING (
    employee_id = auth.uid()
    OR assigned_by = auth.uid()
    OR public.is_hr_or_admin()
    OR (public.current_user_role() = 'manager'
        AND employee_id IN (SELECT id FROM public.profiles WHERE department_id = public.current_user_department()))
  );
DROP POLICY IF EXISTS "assignments_write" ON public.assessment_assignments;
CREATE POLICY "assignments_write" ON public.assessment_assignments FOR ALL TO authenticated
  USING (
    public.is_hr_or_admin()
    OR assigned_by = auth.uid()
    OR (public.current_user_role() = 'manager'
        AND employee_id IN (SELECT id FROM public.profiles WHERE department_id = public.current_user_department()))
    OR employee_id = auth.uid()
  )
  WITH CHECK (
    public.is_hr_or_admin()
    OR assigned_by = auth.uid()
    OR (public.current_user_role() = 'manager')
    OR employee_id = auth.uid()
  );

-- assessment_results
DROP POLICY IF EXISTS "results_select" ON public.assessment_results;
CREATE POLICY "results_select" ON public.assessment_results FOR SELECT TO authenticated
  USING (
    employee_id = auth.uid()
    OR public.is_hr_or_admin()
    OR (public.current_user_role() = 'manager' AND department_id = public.current_user_department())
  );
DROP POLICY IF EXISTS "results_insert" ON public.assessment_results;
CREATE POLICY "results_insert" ON public.assessment_results FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid() OR public.is_hr_or_admin());
DROP POLICY IF EXISTS "results_update" ON public.assessment_results;
CREATE POLICY "results_update" ON public.assessment_results FOR UPDATE TO authenticated
  USING (public.is_hr_or_admin()) WITH CHECK (public.is_hr_or_admin());

-- recommendations & training_plans : lecture propre + équipe/RH, écriture RH/admin/manager.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['recommendations','training_plans'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_select" ON public.%1$s;', t);
    EXECUTE format($f$CREATE POLICY "%1$s_select" ON public.%1$s FOR SELECT TO authenticated
      USING (
        employee_id = auth.uid()
        OR public.is_hr_or_admin()
        OR (public.current_user_role() = 'manager'
            AND employee_id IN (SELECT id FROM public.profiles WHERE department_id = public.current_user_department()))
      );$f$, t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_write" ON public.%1$s;', t);
    EXECUTE format($f$CREATE POLICY "%1$s_write" ON public.%1$s FOR ALL TO authenticated
      USING (public.is_hr_or_admin() OR public.current_user_role() = 'manager')
      WITH CHECK (public.is_hr_or_admin() OR public.current_user_role() = 'manager');$f$, t);
  END LOOP;
END$$;

-- audit_logs : lecture RH/admin, insertion pour tout authentifié.
DROP POLICY IF EXISTS "audit_select" ON public.audit_logs;
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_hr_or_admin());
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- settings : lecture pour tous, écriture super admin uniquement.
DROP POLICY IF EXISTS "settings_read" ON public.settings;
CREATE POLICY "settings_read" ON public.settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "settings_write" ON public.settings;
CREATE POLICY "settings_write" ON public.settings FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
