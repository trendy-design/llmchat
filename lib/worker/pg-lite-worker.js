import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init(options) {
    try {
      console.log(`✅ pg-lite-worker init`);
      const meta = options.meta;
      return new PGlite({
        dataDir: options.dataDir,
      });
    } catch (error) {
      console.error(`❌ pg-lite-worker error`, error);
    }
  },
});
