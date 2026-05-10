import { supabase } from '@/supabase';

function normalizeSortColumn(col) {
  if (col === 'created_date') return 'created_at';
  return col;
}

export async function createProfile(user) {
  const row = {
    id: user.id,
    email: user.email,
    full_name: user.full_name ?? '',
  };
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

export async function insertTestResult(row) {
  const { data, error } = await supabase.from('test_results').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function filterTestResults(criteria, sortField = '-created_at', limit) {
  let query = supabase.from('test_results').select('*');

  if (criteria?.id) {
    query = query.eq('id', criteria.id);
  }
  if (criteria?.user_email) {
    query = query.eq('user_email', criteria.user_email);
  }

  const desc = sortField.startsWith('-');
  const col = normalizeSortColumn(desc ? sortField.slice(1) : sortField);
  query = query.order(col, { ascending: !desc });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listTestResults(sortField = '-created_at', limit = 500) {
  const desc = sortField.startsWith('-');
  const col = normalizeSortColumn(desc ? sortField.slice(1) : sortField);
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .order(col, { ascending: !desc })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listProfilesForAdmin() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
