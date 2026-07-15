import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, Target, TrendingUp, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatCard from '@/components/shared/StatCard';
import SkillBars from '@/components/shared/SkillBars';
import { FitBadge } from '@/components/shared/Badges';
import { computeKpis, skillAverages, profileDistribution, rankByFit } from '@/lib/analytics';

const PIE_COLORS = ['#2563EB', '#14B8A6', '#F97316', '#7C3AED', '#EC4899', '#22C55E', '#0EA5E9', '#F59E0B', '#6366F1', '#475569'];

export default function AnalyticsPanel({
  results = [],
  members = [],
  assignments = [],
  onAssign,
  showMembers = true,
}) {
  const kpis = computeKpis(members, results, assignments);
  const avgScores = skillAverages(kpis.latestResults);
  const distribution = profileDistribution(kpis.latestResults);
  const ranked = rankByFit(members, kpis.latestResults);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Effectif" value={kpis.memberCount} icon={Users} accent="#2563EB" hint={`${kpis.evaluatedCount} évalué(s)`} />
        <StatCard title="Adéquation moyenne" value={`${kpis.avgFit}%`} icon={Target} accent="#14B8A6" />
        <StatCard title="Score global moyen" value={`${kpis.avgGlobal}%`} icon={TrendingUp} accent="#7C3AED" />
        <StatCard title="Taux de couverture" value={`${kpis.coverage}%`} icon={ClipboardCheck} accent="#F97316" hint={`${kpis.pending} en attente`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader>
            <CardTitle className="text-base">Moyenne des compétences</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.latestResults.length ? (
              <SkillBars scores={avgScores} height={360} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune évaluation disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader>
            <CardTitle className="text-base">Répartition des profils</CardTitle>
          </CardHeader>
          <CardContent>
            {distribution.length ? (
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={110} label>
                      {distribution.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée de profil.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showMembers ? (
        <Card className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader>
            <CardTitle className="text-base">Collaborateurs</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Adéquation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun collaborateur.
                    </TableCell>
                  </TableRow>
                ) : (
                  ranked.map((m) => (
                    <TableRow key={m.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium">{m.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.position || '—'}</TableCell>
                      <TableCell className="text-sm">{m.profile_name || '—'}</TableCell>
                      <TableCell>{m.fit != null ? <FitBadge value={m.fit} /> : <span className="text-xs text-muted-foreground">Non évalué</span>}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {m.result_id ? (
                          <Link to={`/app/resultats/${m.result_id}`}>
                            <Button variant="ghost" size="sm">Voir</Button>
                          </Link>
                        ) : null}
                        {onAssign ? (
                          <Button variant="outline" size="sm" onClick={() => onAssign(m)}>
                            Affecter
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
