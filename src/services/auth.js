import { supabase } from '@/supabase';

function mapSessionUser(sessionUser, profile) {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? profile?.email ?? '',
    full_name:
      profile?.full_name ??
      sessionUser.user_metadata?.full_name ??
      sessionUser.email?.split('@')[0] ??
      'Utilisateur',
    role:
      profile?.role ??
      sessionUser.user_metadata?.role ??
      sessionUser.app_metadata?.role ??
      'user',
  };
}

export async function signUp(email, password, { full_name: fullName } = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function promoteToAdmin() {
  const { error } = await supabase.auth.updateUser({
    data: { role: 'admin' },
  });
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('id', session.user.id)
    .maybeSingle();

  return mapSessionUser(session.user, profile);
}

export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(_event, null);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('id', session.user.id)
      .maybeSingle();

    callback(_event, mapSessionUser(session.user, profile));
  });

  return () => subscription.unsubscribe();
}

export async function requestPasswordReset(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/login`,
  });
  if (error) throw error;
}
