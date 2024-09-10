"use client";
import { getPGClient } from "@/libs/database/client";
import { PGliteInterface } from "@electric-sql/pglite";
import { Repl } from "@electric-sql/pglite-repl";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { useEffect, useState } from "react";

const DBReplPage = () => {
  const [db, setDb] = useState<PGliteWorker | null>(null);
  const initDb = async () => {
    const db = await getPGClient();
    setDb(db);
  };

  useEffect(() => {
    initDb();
  }, []);

  if (!db) return null;

  return <Repl pg={db as PGliteInterface} />;
};

export default DBReplPage;
