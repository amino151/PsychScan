import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ProfileCard({ profile }) {
  if (!profile) return null;
  const accent = profile.color || '#6366f1';
  const from = profile.theme?.from || accent;
  const to = profile.theme?.to || '#14b8a6';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="overflow-hidden border border-white/40 bg-white/90 shadow-2xl shadow-brand-primary/10 backdrop-blur-xl">
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-2xl md:text-3xl font-display">{profile.name}</CardTitle>
            <Badge
              className="border-0 text-white shadow-md"
              style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
            >
              Profil dominant
            </Badge>
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{profile.code}</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{profile.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
