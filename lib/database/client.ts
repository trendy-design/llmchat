import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { runMigrations } from "./migrations";
import { schema } from "./schema";

let pgClient: PGlite;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>>;

export const getDB = async () => {
  if (!dbInitializationPromise) {
    console.log("initalizing db");
    dbInitializationPromise = (async () => {
      pgClient = await PGlite.create({
        dataDir: "idb://llmchat",
      });
      await pgClient.waitReady;
      const db = drizzle(pgClient as any, { schema });
      await runMigrations(db);
      return db;
    })();
  }
  return dbInitializationPromise;
};

export const getPGClient = async (): Promise<PGlite> => {
  if (!pgClient) {
    await getDB();
  }
  return pgClient;
};
