import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

// Gestionnaire CRUD générique piloté par une description de colonnes et de champs.
export default function CrudManager({
  title,
  description,
  rows = [],
  columns = [],
  fields = [],
  onSave,
  onDelete,
  idKey = 'id',
  canCreate = true,
  canEdit = true,
  canDelete = true,
  emptyLabel = 'Aucun élément.',
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  function openCreate() {
    const initial = fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? '' }), {});
    setEditing(null);
    setForm(initial);
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm(
      fields.reduce((acc, f) => {
        const raw = row[f.name];
        const value = f.format ? f.format(raw, row) : raw ?? '';
        return { ...acc, [f.name]: value };
      }, {})
    );
    setOpen(true);
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.parse) payload[f.name] = f.parse(payload[f.name]);
      });
      if (editing) payload[idKey] = editing[idKey];
      await onSave?.(payload, editing);
      setOpen(false);
    } catch (err) {
      // Laisse l'appelant gérer le toast d'erreur ; garde la modale ouverte.
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await onDelete?.(toDelete[idKey], toDelete);
    setToDelete(null);
  }

  const showActions = canEdit || canDelete;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {canCreate ? (
          <Button onClick={openCreate} className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/50 bg-white/85 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {showActions ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row[idKey]} className="hover:bg-primary/5 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                  {showActions ? (
                    <TableCell className="text-right whitespace-nowrap">
                      {canEdit ? (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)} title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setToDelete(row)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier' : 'Ajouter'} — {title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={form[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    value={form[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    required={field.required}
                    className="flex h-10 w-full rounded-md border border-input bg-white/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <option value="">— Sélectionner —</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type || 'text'}
                    value={form[field.name] ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L&apos;élément sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
