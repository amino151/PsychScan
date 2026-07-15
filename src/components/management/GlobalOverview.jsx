import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnalyticsPanel from '@/components/shared/AnalyticsPanel';
import SkillRadar from '@/components/shared/SkillRadar';
import { appApi } from '@/services/appApi';
import { DEPARTMENTS } from '@/config/departments';
import { skillAverages, computeKpis } from '@/lib/analytics';

export default function GlobalOverview() {
  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => appApi.entities.Employee.list('full_name'),
    initialData: [],
  });

  const { data: results = [] } = useQuery({
    queryKey: ['all-results'],
    queryFn: () => appApi.entities.Result.list('-created_at', 1000),
    initialData: [],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => appApi.entities.Assignment.list('-assigned_at', 1000),
    initialData: [],
  });

  const perDepartment = DEPARTMENTS.map((dept) => {
    const deptResults = results.filter((r) => r.department_id === dept.id);
    const deptMembers = employees.filter((e) => e.department_id === dept.id);
    const kpis = computeKpis(deptMembers, deptResults, []);
    return {
      dept,
      name: dept.name,
      color: dept.color,
      avgFit: kpis.avgFit,
      avgGlobal: kpis.avgGlobal,
      scores: skillAverages(kpis.latestResults),
      count: deptMembers.length,
    };
  });

  const radarSeries = perDepartment
    .filter((d) => d.count > 0)
    .map((d) => ({ key: d.dept.code, name: d.name, scores: d.scores, color: d.color }));

  return (
    <div className="space-y-6">
      <AnalyticsPanel results={results} members={employees} assignments={assignments} showMembers={false} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader>
            <CardTitle className="text-base">Adéquation moyenne par département</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perDepartment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.12)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgFit" name="Adéquation" radius={[6, 6, 0, 0]}>
                    {perDepartment.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader>
            <CardTitle className="text-base">Comparaison des compétences par département</CardTitle>
          </CardHeader>
          <CardContent>
            {radarSeries.length ? (
              <SkillRadar series={radarSeries} height={320} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune évaluation disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
