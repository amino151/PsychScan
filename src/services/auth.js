import { supabase, isSupabaseConfigured } from '@/supabase';
import { mockAuth } from '@/services/mockStore';

// Mappe une session Supabase + profil vers l'utilisateur applicatif,
// en lisant le rôle et le département depuis la table `profiles`.
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
    role: profile?.role ?? 'employee',
    department_id: profile?.department_id ?? null,
    manager_id: profile?.manager_id ?? null,
    position: profile?.position ?? null,
  };
}

const PROFILE_COLUMNS = 'id, email, full_name, role, department_id, manager_id, position, created_at';

export async function signUp(email, password, { full_name: fullName } = {}) {
  if (!isSupabaseConfigured) {
    return { user: mockAuth.signUp(email, password, { full_name: fullName }) };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function login(email, password) {
  if (!isSupabaseConfigured) {
    return { user: mockAuth.login(email, password) };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  if (!isSupabaseConfigured) {
    mockAuth.logout();
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return mockAuth.getSessionUser();
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', session.user.id)
    .maybeSingle();

  return mapSessionUser(session.user, profile);
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) {
    return mockAuth.onAuthStateChange(callback);
  }
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(_event, null);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', session.user.id)
      .maybeSingle();

    callback(_event, mapSessionUser(session.user, profile));
  });

  return () => subscription.unsubscribe();
}

export async function requestPasswordReset(email, redirectTo) {
  if (!isSupabaseConfigured) {
    // En mode démo, on simule un envoi réussi.
    return { simulated: true };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/login`,
  });
  if (error) throw error;
}
