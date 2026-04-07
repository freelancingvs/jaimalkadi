/**
 * KV store abstraction.
 * - If KV_REST_API_URL is set → uses real Vercel KV (production)
 * - Otherwise → falls back to a local JSON file at .data/store.json (development)
 */

import path from 'path';
import fs from 'fs';

const USE_KV = Boolean(
  process.env.KV_REST_API_URL || 
  process.env.REDIS_URL || 
  process.env.STORAGE_URL ||
  process.env.UPSTASH_REDIS_REST_URL
);

if (process.env.NODE_ENV === 'production' && !USE_KV) {
  console.warn('⚠️ WARNING: No Redis/KV environment variables found. Check Vercel Storage settings.');
} else {
  console.log(USE_KV ? '✅ Using Remote Storage (KV/Redis).' : '🛠️ Using local JSON fallback (Development).');
}

const DEV_STORE_PATH = path.join(process.cwd(), '.data', 'store.json');

// ── Dev file store helpers ──────────────────────────────────────────────────

function readDevStore(): Record<string, unknown> {
  try {
    const dir = path.dirname(DEV_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DEV_STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(DEV_STORE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeDevStore(data: Record<string, unknown>) {
  const dir = path.dirname(DEV_STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_STORE_PATH, JSON.stringify(data, null, 2));
}

let redisClient: any = null;

async function getClient() {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    return kv;
  }
  
  if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
    if (!redisClient) {
      const { createClient } = await import('redis');
      redisClient = createClient({ 
        url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL,
        socket: {
          connectTimeout: 10000,
        }
      });
      await redisClient.connect();
    }
    return redisClient;
  }
  return null;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function kvGet<T>(key: string): Promise<T | null> {
  const client = await getClient();
  if (client) {
    const val = await client.get(key);
    if (!val) return null;
    return typeof val === 'string' ? JSON.parse(val) : val;
  }
  const store = readDevStore();
  return (store[key] as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const client = await getClient();
  if (client) {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    await client.set(key, val);
    return;
  }
  const store = readDevStore();
  store[key] = value;
  writeDevStore(store);
}

export async function kvDel(key: string): Promise<void> {
  const client = await getClient();
  if (client) {
    await client.del(key);
    return;
  }
  const store = readDevStore();
  delete store[key];
  writeDevStore(store);
}
