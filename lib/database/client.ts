import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import { runMigrations } from "./migrations";
import { schema } from "./schema";

let pgClient: PGliteWorker;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>>;

export const getDB = async () => {
  if (!dbInitializationPromise) {
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

      const db = drizzle(pgClient as any, { schema });
      await runMigrations(db);
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
