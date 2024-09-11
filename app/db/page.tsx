"use client";
import { getPGClient } from "@/libs/database/client";
import { PGlite, PGliteInterface } from "@electric-sql/pglite";
import { Repl } from "@electric-sql/pglite-repl";
import { useEffect, useState } from "react";

const DBReplPage = () => {
  const [db, setDb] = useState<PGlite | null>(null);
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
