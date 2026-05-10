import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminUsers({ users, results }) {
  const counts = results.reduce((acc, r) => {
    const key = r.user_email || '—';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="border-white/45 bg-white/90 shadow-panel">
      <CardHeader>
        <CardTitle>Utilisateurs</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun compte enregistré pour le moment. Les invités apparaissent uniquement dans les
            résultats (email invité).
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Tests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{counts[u.email] ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
