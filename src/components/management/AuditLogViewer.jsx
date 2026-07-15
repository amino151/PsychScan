import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appApi } from '@/services/appApi';

export default function AuditLogViewer() {
  const { data: logs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => appApi.entities.AuditLog.list('-created_at', 200),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => appApi.entities.Employee.list('full_name'),
    initialData: [],
  });

  const nameMap = new Map(employees.map((e) => [e.id, e.full_name]));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Journal d&apos;audit</h3>
        <p className="text-sm text-muted-foreground">Traçabilité des actions sensibles.</p>
      </div>
      <div className="rounded-2xl border border-white/50 bg-white/85 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableHead>Date</TableHead>
              <TableHead>Acteur</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entité</TableHead>
              <TableHead>Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucune entrée.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}
                  </TableCell>
                  <TableCell className="text-sm">{nameMap.get(log.actor_id) || log.actor_id || 'Système'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.entity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
