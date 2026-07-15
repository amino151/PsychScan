-- =============================================================================
-- PsychoScan IOS — Données de référence (seed)
-- À exécuter APRÈS la migration `20260715000000_psychoscan_ios_schema.sql`.
-- Idempotent : réexécutable sans doublon (ON CONFLICT).
-- =============================================================================

-- --- Départements ------------------------------------------------------------
INSERT INTO public.departments (code, name, description, color, questionnaire_id, key_skills) VALUES
  ('customer_service',  'Service Client',        'Traitement des demandes clients, réclamations et fidélisation.',        '#0EA5E9', 'quest_customer_service',  '{"customer_orientation":3,"communication":3,"emotional_intelligence":2,"stress_management":2,"adaptability":1}'::jsonb),
  ('sales',             'Ventes & Commercial',   'Prospection, négociation et développement du chiffre d''affaires.',     '#F97316', 'quest_sales',             '{"communication":3,"customer_orientation":3,"leadership":2,"adaptability":2,"stress_management":1}'::jsonb),
  ('technical_support', 'Support Technique',      'Diagnostic, résolution d''incidents et accompagnement technique.',      '#6366F1', 'quest_technical_support', '{"problem_solving":3,"critical_thinking":3,"rigor":2,"communication":2,"stress_management":1}'::jsonb),
  ('human_resources',   'Ressources Humaines',   'Recrutement, développement des talents et climat social.',              '#14B8A6', 'quest_human_resources',   '{"emotional_intelligence":3,"communication":3,"teamwork":2,"leadership":2,"critical_thinking":1}'::jsonb)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name, description = EXCLUDED.description, color = EXCLUDED.color,
      questionnaire_id = EXCLUDED.questionnaire_id, key_skills = EXCLUDED.key_skills;

-- --- Catégories de questions (compétences) -----------------------------------
INSERT INTO public.question_categories (code, name, "order") VALUES
  ('communication', 'Communication', 1),
  ('stress_management', 'Gestion du stress', 2),
  ('leadership', 'Leadership', 3),
  ('teamwork', 'Travail d''équipe', 4),
  ('adaptability', 'Adaptabilité', 5),
  ('emotional_intelligence', 'Intelligence émotionnelle', 6),
  ('problem_solving', 'Résolution de problèmes', 7),
  ('customer_orientation', 'Orientation client', 8),
  ('critical_thinking', 'Esprit critique', 9),
  ('rigor', 'Rigueur', 10)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order";

-- --- Questionnaires ----------------------------------------------------------
INSERT INTO public.questionnaires (code, title, description, department_id)
SELECT v.code, v.title, v.description, d.id
FROM (VALUES
  ('quest_customer_service',  'Évaluation — Service Client',       'Compétences relationnelles, orientation client et gestion du stress.', 'customer_service'),
  ('quest_sales',             'Évaluation — Ventes & Commercial',  'Persuasion, orientation client, résilience et sens du résultat.',      'sales'),
  ('quest_technical_support', 'Évaluation — Support Technique',    'Résolution de problèmes, esprit critique, rigueur et pédagogie.',      'technical_support'),
  ('quest_human_resources',   'Évaluation — Ressources Humaines',  'Intelligence émotionnelle, communication et développement des talents.', 'human_resources')
) AS v(code, title, description, dept_code)
JOIN public.departments d ON d.code = v.dept_code
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- --- Profils psychologiques (exemples clés) ----------------------------------
INSERT INTO public.psychological_profiles (code, name, description, strengths, weaknesses, recommended_careers, dominant_traits, color) VALUES
  ('customer_champion', 'Champion de la relation client', 'Place la satisfaction client au cœur de son action.',
    '["Orientation client","Écoute active","Communication"]'::jsonb, '["Peut sur-promettre","Charge émotionnelle"]'::jsonb,
    '["Conseiller senior","Référent qualité"]'::jsonb, '{"customer_orientation":3,"communication":3,"emotional_intelligence":2}'::jsonb, '#0EA5E9'),
  ('resilient_operator', 'Opérateur résilient', 'Garde son calme sous forte pression.',
    '["Gestion du stress","Adaptabilité","Fiabilité"]'::jsonb, '["Internalise la pression"]'::jsonb,
    '["Agent polyvalent","Gestion de crise"]'::jsonb, '{"stress_management":3,"adaptability":2,"rigor":2}'::jsonb, '#F97316'),
  ('team_leader', 'Leader d''équipe', 'Mobilise et structure le collectif.',
    '["Leadership","Communication","Esprit d''équipe"]'::jsonb, '["Délégation limitée"]'::jsonb,
    '["Chef de plateau","Superviseur"]'::jsonb, '{"leadership":3,"communication":2,"teamwork":2}'::jsonb, '#EA580C'),
  ('analytical_solver', 'Résolveur analytique', 'Décortique les problèmes avec méthode.',
    '["Résolution de problèmes","Esprit critique","Rigueur"]'::jsonb, '["Sur-analyse"]'::jsonb,
    '["Support niveau 2","Analyste qualité"]'::jsonb, '{"problem_solving":3,"critical_thinking":3,"rigor":2}'::jsonb, '#6366F1'),
  ('people_developer', 'Développeur de talents', 'Révèle le potentiel des autres.',
    '["Intelligence émotionnelle","Leadership","Communication"]'::jsonb, '["Difficulté à trancher"]'::jsonb,
    '["Formateur","Coach interne"]'::jsonb, '{"emotional_intelligence":3,"leadership":2,"communication":2}'::jsonb, '#7C3AED')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- --- Exemples de questions (le référentiel complet est fourni côté application
--     dans src/lib/questionData.js et peut être synchronisé par les admins) ----
INSERT INTO public.questions (questionnaire_id, category, type, text, options, "order")
SELECT q.id, v.category, v.type, v.text, v.options::jsonb, v.ord
FROM (VALUES
  ('quest_customer_service', 'customer_orientation', 'situation',
   'Un client mécontent hausse le ton au téléphone. Votre première réaction :',
   '[{"text":"Rester calme, reconnaître son émotion et reformuler son besoin","scores":{"emotional_intelligence":3,"communication":2,"stress_management":2}},{"text":"Appliquer strictement la procédure","scores":{"rigor":2}},{"text":"Transférer au superviseur","scores":{"teamwork":1}},{"text":"Proposer un geste commercial","scores":{"customer_orientation":2}}]', 1),
  ('quest_customer_service', 'stress_management', 'scale',
   'La satisfaction du client prime sur le respect strict du script.',
   '[{"text":"1","scores":{"rigor":3}},{"text":"2","scores":{"rigor":2}},{"text":"3","scores":{"customer_orientation":1}},{"text":"4","scores":{"customer_orientation":2}},{"text":"5","scores":{"customer_orientation":3}}]', 2)
) AS v(qcode, category, type, text, options, ord)
JOIN public.questionnaires q ON q.code = v.qcode
ON CONFLICT DO NOTHING;

-- --- Paramètres système ------------------------------------------------------
INSERT INTO public.settings (key, value, label) VALUES
  ('company_name', 'PsychoScan IOS', 'Nom de l''entreprise'),
  ('assessment_reminder_days', '7', 'Rappel avant échéance (jours)'),
  ('default_pass_score', '60', 'Score d''adéquation cible (%)'),
  ('allow_self_assessment', 'true', 'Auto-évaluation autorisée')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label;

-- =============================================================================
-- SUPER ADMIN DE DÉMONSTRATION
-- 1. Créez l'utilisateur dans Supabase : Authentication → Users → Add user
--    email : admin@psychoscan.io   (mot de passe de votre choix)
-- 2. Le trigger `handle_new_user` crée automatiquement son profil (role employee).
-- 3. Promouvez-le en super admin :
--
--    UPDATE public.profiles
--    SET role = 'super_admin', full_name = 'Super Admin', position = 'Directeur des opérations'
--    WHERE email = 'admin@psychoscan.io';
--
-- Répétez l'opération pour créer un hr_admin, un manager (avec department_id) et
-- des employés, en renseignant department_id / manager_id selon votre organisation.
-- =============================================================================
