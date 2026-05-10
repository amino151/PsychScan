-- MindScan: profiles + test_results only (no orders, no storage).
-- Run in Supabase Dashboard → SQL Editor once.
-- Then: Authentication → URL configuration → add http://localhost:5173 (and production URL).

CREATE OR REPLACE FUNCTION public.request_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(TRIM(auth.jwt()->'user_metadata'->>'role'), ''), 'user');
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.request_user_role() = 'admin');

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  user_email text NOT NULL,
  user_name text,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_code text,
  profile_name text,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completion_time_seconds integer,
  is_guest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results (user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_email ON public.test_results (user_email);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "test_results_insert" ON public.test_results;
CREATE POLICY "test_results_insert"
  ON public.test_results FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "test_results_select" ON public.test_results;
CREATE POLICY "test_results_select"
  ON public.test_results FOR SELECT
  USING (
    public.request_user_role() = 'admin'
    OR auth.uid() = user_id
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );
