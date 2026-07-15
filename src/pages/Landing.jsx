import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radar,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Users,
  Building2,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { roleHome } from '@/config/roles';

const features = [
  {
    icon: Radar,
    title: 'Évaluation par compétences',
    description:
      "Un moteur configurable mesure 10 compétences clés (communication, gestion du stress, orientation client…) adaptées à chaque département.",
  },
  {
    icon: Building2,
    title: 'Questionnaires par département',
    description:
      'Service Client, Ventes, Support Technique et RH : des parcours ciblés selon le poste occupé.',
  },
  {
    icon: BarChart3,
    title: 'Tableaux de bord analytiques',
    description:
      'KPIs, radars, tendances et comparaisons par équipe et par département avec des graphiques interactifs.',
  },
  {
    icon: ShieldCheck,
    title: 'Accès par rôle (RBAC)',
    description:
      'Employé, Manager, Admin RH et Super Admin : chacun accède uniquement aux données qui le concernent.',
  },
  {
    icon: GraduationCap,
    title: 'Recommandations & formations',
    description:
      "Détection automatique des axes d'amélioration et suggestions de plans de formation personnalisés.",
  },
  {
    icon: FileText,
    title: 'Rapports PDF corporate',
    description:
      "Générez des bilans professionnels avec profil, compétences, adéquation au poste et plan de développement.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Landing() {
  const { user } = useAuth();
  const primaryHref = user ? roleHome(user.role) : '/login';

  return (
    <div className="relative min-h-screen bg-background">
      <header className="relative z-10 max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold font-display">
          <span className="rounded-lg bg-brand-gradient p-1.5">
            <Radar className="w-5 h-5 text-white" />
          </span>
          PsychoScan IOS
        </div>
        <Link to={primaryHref}>
          <Button size="sm" className="rounded-full gap-1.5">
            {user ? 'Mon tableau de bord' : 'Se connecter'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-primary text-sm font-medium mb-8 shadow-sm"
          >
            <Users className="w-4 h-4" />
            Plateforme RH d&apos;évaluation des talents
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-tight text-slate-900"
          >
            Évaluez et développez les compétences
            <br />
            de vos <span className="text-primary">équipes de centre d&apos;appels</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed"
          >
            PsychoScan IOS aide les RH et managers à mesurer objectivement les compétences
            comportementales, identifier les profils et piloter la montée en compétence, département
            par département.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={primaryHref}>
              <Button size="lg" className="text-base px-8 h-12 rounded-full gap-2 shadow-lg shadow-primary/25">
                Accéder à la plateforme
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Une solution RH complète</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              De l&apos;évaluation au plan de développement, tout au même endroit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="group p-6 rounded-2xl bg-card/95 border border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-semibold">PsychoScan IOS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 PsychoScan IOS. Plateforme RH d&apos;évaluation des compétences.
          </p>
        </div>
      </footer>
    </div>
  );
}
