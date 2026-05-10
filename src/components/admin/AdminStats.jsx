import React from 'react';
import { Brain, HelpCircle, Users, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminStats({ results, users, questions }) {
  const stats = [
    {
      title: 'Résultats',
      value: results.length,
      icon: ClipboardList,
    },
    {
      title: 'Utilisateurs enregistrés',
      value: users.length,
      icon: Users,
    },
    {
      title: 'Questions actives',
      value: questions.filter((q) => q.is_active !== false).length,
      icon: HelpCircle,
    },
    {
      title: 'Total questions',
      value: questions.length,
      icon: Brain,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ title, value, icon: Icon }) => (
        <Card key={title} className="border-white/45 bg-white/85 shadow-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
