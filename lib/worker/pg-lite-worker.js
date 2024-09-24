import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init(options) {
    try {
      const meta = options.meta;
      return new PGlite({
        dataDir: options.dataDir,
        relaxedDurability: true,
      });
    } catch (error) {
      console.error(`❌ pg-lite-worker error`, error);
    }
  },
});
