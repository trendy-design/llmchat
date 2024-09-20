//@ts-nocheck
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import migration1 from "./0000_tough_stingray.sql";
import { runMigrationv1 } from "./migration_v1";

export type Migration = {
  id: string;
  sql?: string;
  run?: (db: ReturnType<typeof drizzle>) => Promise<void>;
};

export const migrations: Migration[] = [
  {
    id: "migration1",
    sql: migration1,
  },
  {
    id: "runMigrationv1",
    run: runMigrationv1,
  },
];

export async function runMigrations(client: ReturnType<typeof drizzle>) {
  // Create a migrations table if it doesn't exist
  await client.execute(sql`
    CREATE TABLE IF NOT EXISTS drizzle_migrations (
      id SERIAL PRIMARY KEY,
      migration_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const executedMigrations = await client.execute(sql`
    SELECT migration_name FROM drizzle_migrations
  `);
  const executedMigrationSet = new Set(
    executedMigrations.rows.map((row) => row.migration_name),
  );

  for (const migration of migrations) {
    if (!executedMigrationSet.has(migration.id)) {
      try {
        if (migration.sql) {
          const statements = migration.sql.includes("--> statement-breakpoint")
            ? migration.sql.split("--> statement-breakpoint")
            : [migration.sql];

          for (const statement of statements) {
            const trimmedStatement = statement.trim();
            if (trimmedStatement) {
              await client.execute(sql.raw(trimmedStatement));
            }
          }
        }

        if (migration.run) {
          await migration.run(client);
        }

        await client.execute(sql`
          INSERT INTO drizzle_migrations (migration_name) VALUES (${migration.id})
        `);
      } catch (error) {
        console.error(`Error executing migration ${migration.id}:`, error);
        throw error; // Stop execution if a migration fails
      }
    }
  }
}
