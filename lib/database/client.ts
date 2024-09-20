import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import { migrations, runMigrations } from "./migrations";
import { schema } from "./schema";

const CURRENT_DB_VERSION = migrations.length;

let pgClient: PGliteWorker;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>>;

export const getDB = async () => {
  console.log(`✅ db initialization started 1`);

  if (!dbInitializationPromise) {
    const startTime = performance.now();
    console.log(`✅ db initialization started 2`);

    dbInitializationPromise = (async () => {
      pgClient = new PGliteWorker(
        new Worker(new URL("../worker/pg-lite-worker.js", import.meta.url), {
          type: "module",
        }),
        {
          dataDir: "idb://llmchat",
          meta: {},
        },
      );
      await pgClient.waitReady;

      console.log(
        `✅ pg client ready`,
        (performance.now() - startTime).toFixed(2),
      );

      const db = drizzle(pgClient as any, { schema });
      await runMigrations(db);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`✅ db initialized in ${loadTime.toFixed(2)}ms`);
      return db;
    })();
  }
  return dbInitializationPromise;
};

export const getPGClient = async (): Promise<PGliteWorker> => {
  if (!pgClient) {
    await getDB();
  }
  return pgClient;
};
