import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import { migrations, runMigrations } from "./migrations";
import { schema } from "./schema";

const CURRENT_DB_VERSION = migrations.length;

let pgClient: PGliteWorker;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>>;

export const getDB = async () => {
  if (!dbInitializationPromise) {
    dbInitializationPromise = (async () => {
      const storedVersion = localStorage.getItem("dbVersion");

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
      const db = drizzle(pgClient as any, { schema });

      if (!storedVersion || parseInt(storedVersion) < CURRENT_DB_VERSION) {
        await runMigrations(db);
        localStorage.setItem("dbVersion", CURRENT_DB_VERSION.toString());
      }

      console.log("✅ db initialized");
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
