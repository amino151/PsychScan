// Magasin de données local (localStorage) pour le mode démo sans Supabase.
// Fournit un CRUD générique par "table" et une authentification simulée
// avec comptes de démonstration par rôle.

import { buildSeedDatabase, DEMO_PASSWORD, seedProfiles } from '@/services/mockData';

const DB_KEY = 'psychoscan_db_v1';
const SESSION_KEY = 'psychoscan_session';

const memoryFallback = { store: {} };

function hasWindow() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readRaw(key) {
  if (hasWindow()) return window.localStorage.getItem(key);
  return memoryFallback.store[key] ?? null;
}

function writeRaw(key, value) {
  if (hasWindow()) window.localStorage.setItem(key, value);
  else memoryFallback.store[key] = value;
}

function seedCredentials() {
  return seedProfiles.reduce(
    (acc, p) => ({ ...acc, [p.email.toLowerCase()]: DEMO_PASSWORD }),
    {}
  );
}

function loadDb() {
  const raw = readRaw(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* corruption -> reseed */
    }
  }
  const fresh = { ...buildSeedDatabase(), credentials: seedCredentials() };
  writeRaw(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDb(db) {
  writeRaw(DB_KEY, JSON.stringify(db));
}

let db = loadDb();

export function resetMockDatabase() {
  db = { ...buildSeedDatabase(), credentials: seedCredentials() };
  saveDb(db);
  return db;
}

function ensureTable(table) {
  if (!db[table]) db[table] = [];
  return db[table];
}

function genId(prefix = 'id') {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${uuid.replace(/-/g, '').slice(0, 16)}`;
}

function matchesFilter(row, filter) {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined) return true;
    if (Array.isArray(value)) return value.includes(row[key]);
    return row[key] === value;
  });
}

function applySort(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

// --- CRUD générique ------------------------------------------------------
export const mockDb = {
  list(table, { filter, sort, limit } = {}) {
    let rows = ensureTable(table).filter((r) => matchesFilter(r, filter));
    rows = applySort(rows, sort);
    if (limit != null) rows = rows.slice(0, limit);
    return rows.map((r) => ({ ...r }));
  },

  get(table, id) {
    const row = ensureTable(table).find((r) => r.id === id);
    return row ? { ...row } : null;
  },

  findOne(table, filter) {
    const row = ensureTable(table).find((r) => matchesFilter(r, filter));
    return row ? { ...row } : null;
  },

  insert(table, row, prefix) {
    const list = ensureTable(table);
    const record = {
      id: row.id || genId(prefix || table.slice(0, 3)),
      created_at: row.created_at || new Date().toISOString(),
      ...row,
    };
    if (!record.id) record.id = genId(prefix || table.slice(0, 3));
    list.push(record);
    saveDb(db);
    return { ...record };
  },

  update(table, id, patch) {
    const list = ensureTable(table);
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    saveDb(db);
    return { ...list[idx] };
  },

  // Upsert par clé arbitraire (par défaut "id").
  upsert(table, row, key = 'id') {
    const list = ensureTable(table);
    const idx = list.findIndex((r) => r[key] === row[key]);
    if (idx === -1) {
      return this.insert(table, row);
    }
    list[idx] = { ...list[idx], ...row };
    saveDb(db);
    return { ...list[idx] };
  },

  remove(table, id) {
    const list = ensureTable(table);
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    saveDb(db);
    return true;
  },
};

// --- Authentification simulée -------------------------------------------
const authListeners = new Set();

function emitAuth(event, user) {
  authListeners.forEach((cb) => {
    try {
      cb(event, user);
    } catch {
      /* ignore listener errors */
    }
  });
}

function profileToUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role || 'employee',
    department_id: profile.department_id ?? null,
    manager_id: profile.manager_id ?? null,
    position: profile.position ?? null,
  };
}

export const mockAuth = {
  getSessionUser() {
    const raw = readRaw(SESSION_KEY);
    if (!raw) return null;
    try {
      const { userId } = JSON.parse(raw);
      const profile = mockDb.get('profiles', userId);
      return profileToUser(profile);
    } catch {
      return null;
    }
  },

  login(email, password) {
    const normalized = String(email || '').trim().toLowerCase();
    const expected = db.credentials?.[normalized];
    if (!expected || expected !== password) {
      const err = new Error('Email ou mot de passe incorrect.');
      err.status = 401;
      throw err;
    }
    const profile = mockDb.findOne('profiles', { email: normalized });
    if (!profile) {
      throw new Error('Compte introuvable.');
    }
    writeRaw(SESSION_KEY, JSON.stringify({ userId: profile.id }));
    const user = profileToUser(profile);
    emitAuth('SIGNED_IN', user);
    return user;
  },

  signUp(email, password, { full_name: fullName, role = 'employee', department_id = null } = {}) {
    const normalized = String(email || '').trim().toLowerCase();
    if (mockDb.findOne('profiles', { email: normalized })) {
      throw new Error('Un compte existe déjà avec cet email.');
    }
    const profile = mockDb.insert(
      'profiles',
      {
        email: normalized,
        full_name: fullName || normalized.split('@')[0],
        role,
        department_id,
        manager_id: null,
        position: null,
        hire_date: new Date().toISOString().slice(0, 10),
        avatar_color: '#2563EB',
      },
      'usr'
    );
    db.credentials = { ...(db.credentials || {}), [normalized]: password };
    saveDb(db);
    writeRaw(SESSION_KEY, JSON.stringify({ userId: profile.id }));
    const user = profileToUser(profile);
    emitAuth('SIGNED_IN', user);
    return user;
  },

  logout() {
    if (hasWindow()) window.localStorage.removeItem(SESSION_KEY);
    else delete memoryFallback.store[SESSION_KEY];
    emitAuth('SIGNED_OUT', null);
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
  },
};
