import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & { __schoolPool?: Pool };

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return new Pool({ connectionString: url, max: 10 });
}

// Created lazily so `next build` works without a database connection.
export function getPool(): Pool {
  if (!globalForDb.__schoolPool) globalForDb.__schoolPool = createPool();
  return globalForDb.__schoolPool;
}

let cached: ReturnType<typeof makeDb> | null = null;
function makeDb() {
  return drizzle(getPool(), { schema });
}
export function getDb() {
  if (!cached) cached = makeDb();
  return cached;
}
