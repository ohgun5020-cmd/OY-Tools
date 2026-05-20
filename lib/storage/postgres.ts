import "server-only"

import { Pool, type QueryResult } from "pg"

const globalStore = globalThis as typeof globalThis & {
  __oyPostgresPool?: Pool
  __oyPostgresSchemaReady?: Promise<void>
}

export function isPostgresConfigured() {
  return Boolean(getDatabaseUrl())
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null
}

export async function queryPostgres<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T> | null> {
  const pool = getPostgresPool()

  if (!pool) {
    return null
  }

  await ensurePostgresSchema(pool)

  return pool.query<T>(text, values)
}

function getPostgresPool() {
  const connectionString = getDatabaseUrl()

  if (!connectionString) {
    return null
  }

  if (!globalStore.__oyPostgresPool) {
    globalStore.__oyPostgresPool = new Pool({
      connectionString,
      max: 3,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
    })
  }

  return globalStore.__oyPostgresPool
}

async function ensurePostgresSchema(pool: Pool) {
  if (!globalStore.__oyPostgresSchemaReady) {
    globalStore.__oyPostgresSchemaReady = pool.query(schemaSql).then(() => undefined)
  }

  return globalStore.__oyPostgresSchemaReady
}

const schemaSql = `
create extension if not exists pgcrypto;

create table if not exists public.oy_panel_orders (
  id uuid primary key default gen_random_uuid(),
  provider_order_id text not null,
  platform text not null,
  service_id text not null,
  service_name text not null,
  link text not null,
  quantity integer not null check (quantity > 0),
  charge numeric(12, 4) not null default 0,
  currency text not null default 'USD',
  status text not null default 'Pending',
  remains integer,
  start_count integer,
  raw_status jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists oy_panel_orders_created_at_idx
  on public.oy_panel_orders (created_at desc);

create index if not exists oy_panel_orders_provider_order_id_idx
  on public.oy_panel_orders (provider_order_id);

create table if not exists public.oy_panel_services (
  service_id text primary key,
  name text not null,
  category text not null default 'Uncategorized',
  platform text not null default 'Other',
  type text not null default 'Default',
  rate numeric(12, 4) not null default 0,
  min_quantity integer not null default 1,
  max_quantity integer not null default 1000,
  currency text not null default 'USD',
  is_favorite boolean not null default false,
  is_enabled boolean not null default true,
  raw jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists oy_panel_services_platform_idx
  on public.oy_panel_services (platform);

create table if not exists public.oy_panel_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
`
