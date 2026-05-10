import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Sparkles, BarChart3, Shield, Clock, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sparkles,
    title: "Analyse personnalisée",
    description: "Un moteur de scoring pondéré identifie votre profil parmi 10 archétypes psychologiques."
  },
  {
    icon: BarChart3,
    title: "Résultats détaillés",
    description: "Graphiques interactifs, points forts, axes d'amélioration et recommandations de carrière."
  },
  {
    icon: Shield,
    title: "Confidentialité totale",
    description: "Vos données sont sécurisées et ne sont jamais partagées avec des tiers."
  },
  {
    icon: Clock,
    title: "5 minutes seulement",
    description: "Un test concis mais précis composé de 15 questions soigneusement sélectionnées."
  },
  {
    icon: Users,
    title: "Profils multiples",
    description: "10 profils distincts basés sur des dimensions comportementales complémentaires."
  },
  {
    icon: Zap,
    title: "Résultats instantanés",
    description: "Obtenez votre analyse complète immédiatement après avoir terminé le test."
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-primary text-sm font-medium mb-8 shadow-sm"
            >
              <Brain className="w-4 h-4" />
              Plateforme d'analyse psychologique
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight text-slate-900"
            >
              Découvrez votre{' '}
              <span className="text-primary">profil</span>
              <br />
              psychologique
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed"
            >
              Un questionnaire intelligent de 15 questions pour révéler votre type
              psychologique, vos forces et vos pistes de développement personnel.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/test">
                <Button size="lg" className="text-base px-8 h-12 rounded-full gap-2 shadow-lg shadow-primary/25">
                  Commencer le test
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/test">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-full">
                  Mode invité
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Comment ça marche
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Une expérience simple et éclairante en quelques minutes
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4 group-hover:from-primary/25 group-hover:to-secondary/25 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/15 border border-primary/20 shadow-2xl shadow-primary/10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Prêt à vous découvrir ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Le test est gratuit, confidentiel et ne prend que 5 minutes. 
              Aucune inscription requise pour commencer.
            </p>
            <Link to="/test">
              <Button size="lg" className="text-base px-10 h-12 rounded-full gap-2 shadow-lg shadow-primary/25">
                Lancer l'analyse
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-semibold">MindScan</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MindScan. Plateforme d'analyse psychologique.
          </p>
        </div>
      </footer>
    </div>
  );
}