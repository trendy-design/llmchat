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

  // Run migrations
  for (const migration of migrations) {
    const result = await client.execute(sql`
            SELECT * FROM drizzle_migrations WHERE migration_name = ${migration.id}
          `);

    if (result.rows.length === 0) {
      try {
        if (migration.sql) {
          // Execute the SQL directly if there's no breakpoint
          if (!migration.sql.includes("--> statement-breakpoint")) {
            await client.execute(sql.raw(migration.sql.trim()));
          } else {
            // Split and execute multiple statements if breakpoints exist
            const statements = migration.sql.split("--> statement-breakpoint");
            for (const statement of statements) {
              const trimmedStatement = statement.trim();
              if (trimmedStatement) {
                await client.execute(sql.raw(trimmedStatement));
              }
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
        console.error(error);
      }
    }
  }
}
