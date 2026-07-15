# PsychoScan IOS

Plateforme RH d'évaluation des compétences pour les collaborateurs d'un **centre d'appels**.
Les employés sont évalués selon leur **département** via des questionnaires ciblés ; l'application
génère un profil professionnel, des forces/faiblesses, des axes d'amélioration, des recommandations
de formation et de carrière, ainsi que des tableaux de bord analytiques par rôle.

## Stack technique

- **Vite** + **React 18** (JavaScript / JSX)
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **@tanstack/react-query** (données), **recharts** (graphiques), **framer-motion** (animations)
- **jsPDF** + **html2canvas** (rapports PDF)
- **Supabase** (auth + base de données PostgreSQL) — **optionnel** (mode démo local sinon)
- **react-hook-form** + **zod** (validation)

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez http://localhost:5173.

Sans configuration Supabase, l'application démarre en **mode démonstration local** :
les données sont stockées dans le `localStorage` du navigateur et des comptes de démonstration
sont disponibles pour chaque rôle.

### Scripts

| Commande            | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Serveur de développement Vite        |
| `npm run build`     | Build de production                  |
| `npm run preview`   | Prévisualisation du build            |
| `npm run lint`      | Analyse ESLint                       |

## Comptes de démonstration (mode local)

Mot de passe commun : **`demo1234`**

| Rôle          | Email                       | Accès                                             |
| ------------- | --------------------------- | ------------------------------------------------- |
| Super Admin   | `admin@psychoscan.io`       | Supervision globale, config système, audit        |
| Admin RH      | `rh@psychoscan.io`          | Gestion employés, départements, questionnaires…   |
| Manager       | `manager@psychoscan.io`     | Tableau de bord de son département (Service Client)|
| Employé       | `agent@psychoscan.io`       | Ses évaluations et son plan de développement       |

Sur l'écran de connexion, des boutons permettent de se connecter en un clic à chaque compte.

## Rôles (RBAC)

- **employee** — passe ses évaluations, consulte ses résultats.
- **manager** — voit les résultats/progressions de son département.
- **hr_admin** — gère employés, départements, questionnaires, formations, recommandations.
- **super_admin** — accès complet + profils psychologiques, paramètres système, audit.

Après connexion, l'utilisateur est redirigé vers le tableau de bord de son rôle.

## Architecture

```
src/
  config/        roles, departments, skills, profiles, trainings (référentiels)
  lib/           scoring (moteur d'évaluation), insights, analytics, questionData
  services/      auth, database, appApi (façade), mockStore + mockData (mode démo)
  components/    ui (shadcn), shared (PageHeader, StatCard, SkillRadar, CrudManager…),
                 management (CRUD), layout, results, test
  pages/         Landing, Login, SignUp, ForgotPassword, Assessment, Results,
                 employee/ manager/ hr/ superadmin/
supabase/
  migrations/    schéma normalisé + RLS
  seed.sql       données de référence
```

Le **moteur d'évaluation** (`src/lib/scoring.js`) est générique : il note un ensemble configurable
de **compétences** (`src/config/skills.js`). Chaque **département** (`src/config/departments.js`)
pondère un sous-ensemble de compétences clés, ce qui alimente le calcul d'**adéquation au poste**
et les insights spécifiques au département.

## Configuration Supabase (optionnel)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. SQL Editor → exécutez `supabase/migrations/20260715000000_psychoscan_ios_schema.sql`.
3. SQL Editor → exécutez `supabase/seed.sql` (départements, questionnaires, profils, paramètres).
4. Authentication → URL configuration → ajoutez `http://localhost:5173` (et l'URL de production).
5. Créez le super admin (Authentication → Users) puis promouvez-le :
   ```sql
   UPDATE public.profiles SET role = 'super_admin' WHERE email = 'admin@psychoscan.io';
   ```
6. Copiez `.env.example` vers `.env` et renseignez :
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
7. Redémarrez `npm run dev`. L'application bascule automatiquement en mode Supabase.

Le schéma applique la **sécurité au niveau ligne (RLS)** par rôle :
super_admin voit tout, hr_admin gère les employés, manager voit son département,
employee accède uniquement à ses propres données.

## Réinitialiser les données de démo

En mode local, videz le `localStorage` du navigateur (ou la clé `psychoscan_db_v1`) pour
régénérer le jeu de données de démonstration.
