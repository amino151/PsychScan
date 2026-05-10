import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminProfiles({ profiles }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profiles.map((p) => (
        <Card key={p.id || p.code} className="border-white/45 bg-white/90 shadow-panel overflow-hidden">
          <div
            className="h-1.5"
            style={{
              background: `linear-gradient(90deg, ${p.theme?.from || p.color || '#2563EB'}, ${p.theme?.to || '#8B5CF6'})`,
            }}
          />
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg">{p.name}</CardTitle>
            <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
              {p.code}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="line-clamp-3">{p.description}</p>
            {p.dominant_traits && (
              <p className="text-xs font-mono">
                {Object.entries(p.dominant_traits)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
