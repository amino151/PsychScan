import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminQuestions({ questions }) {
  const sorted = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <Card className="border-white/45 bg-white/90 shadow-panel">
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableHead>Ordre</TableHead>
              <TableHead>Texte</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Actif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((q) => (
              <TableRow key={q.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="font-mono text-xs">{q.order}</TableCell>
                <TableCell className="max-w-md truncate" title={q.text}>
                  {q.text}
                </TableCell>
                <TableCell>{q.type}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{q.category}</TableCell>
                <TableCell>
                  <Badge variant={q.is_active !== false ? 'default' : 'secondary'}>
                    {q.is_active !== false ? 'oui' : 'non'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
