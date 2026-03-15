import knex, { type Knex } from "knex";

// ── Config ────────────────────────────────────────────────
const config: Knex.Config = {
  client: "mysql2",

  connection: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "myapp",
    // keep connection alive
    connectTimeout: 10_000,
  },

  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30_000, // wait 30s before throwing
    idleTimeoutMillis: 600_000, // release idle connections after 10min
    reapIntervalMillis: 1_000, // check for idle every 1s
  },

  // auto add created_at / updated_at
  migrations: {
    tableName: "knex_migrations",
    directory: "./db/migrations",
    extension: "ts",
  },

  // log queries in development only
  debug: process.env.NODE_ENV === "development",
};

// ── Singleton (prevents too many connections on hot reload) ──
declare global {
  // eslint-disable-next-line no-var
  var __db: Knex | undefined;
}

export const db: Knex = globalThis.__db ?? knex(config);

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

// ── Health check helper ───────────────────────────────────
export async function checkDbConnection(): Promise<void> {
  try {
    await db.raw("SELECT 1");
    console.log("✅ MySQL connected");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    throw err;
  }
}
