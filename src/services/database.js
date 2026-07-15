// Couche d'accès aux données : CRUD générique pour toutes les entités.
// Bascule automatiquement entre Supabase (si configuré) et le magasin local
// de démonstration (mock) sinon.

import { supabase, isSupabaseConfigured } from '@/supabase';
import { mockDb } from '@/services/mockStore';

function parseSort(sort) {
  if (!sort) return null;
  const desc = sort.startsWith('-');
  return { field: desc ? sort.slice(1) : sort, ascending: !desc };
}

export async function dbList(table, { filter, sort, limit } = {}) {
  if (!isSupabaseConfigured) {
    return mockDb.list(table, { filter, sort, limit });
  }
  let query = supabase.from(table).select('*');
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) query = query.in(key, value);
      else query = query.eq(key, value);
    });
  }
  const parsed = parseSort(sort);
  if (parsed) query = query.order(parsed.field, { ascending: parsed.ascending });
  if (limit != null) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function dbGet(table, id) {
  if (!isSupabaseConfigured) {
    return mockDb.get(table, id);
  }
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function dbFindOne(table, filter) {
  if (!isSupabaseConfigured) {
    return mockDb.findOne(table, filter);
  }
  const rows = await dbList(table, { filter, limit: 1 });
  return rows[0] ?? null;
}

export async function dbInsert(table, row) {
  if (!isSupabaseConfigured) {
    return mockDb.insert(table, row);
  }
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function dbUpdate(table, id, patch) {
  if (!isSupabaseConfigured) {
    return mockDb.update(table, id, patch);
  }
  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function dbUpsert(table, row, onConflict = 'id') {
  if (!isSupabaseConfigured) {
    return mockDb.upsert(table, row, onConflict);
  }
  const { data, error } = await supabase.from(table).upsert(row, { onConflict }).select().single();
  if (error) throw error;
  return data;
}

export async function dbRemove(table, id) {
  if (!isSupabaseConfigured) {
    return mockDb.remove(table, id);
  }
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}
