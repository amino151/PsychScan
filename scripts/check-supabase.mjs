/**
 * Quick check: loads ../.env and tries to reach Supabase REST for `profiles`.
 * Run: node --env-file=.env scripts/check-supabase.mjs   (Node 20+)
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing .env');
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
  process.exit(1);
}

try {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/profiles?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  const text = await res.text();
  console.log('HTTP', res.status, res.statusText);
  if (!res.ok) {
    console.log(text.slice(0, 500));
    process.exit(res.status === 401 || res.status === 403 ? 1 : 0);
  }
  console.log('OK — anon key accepted by PostgREST.');
  process.exit(0);
} catch (e) {
  console.error('Network error (offline or DNS):', e.message);
  process.exit(1);
}
