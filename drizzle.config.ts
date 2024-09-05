import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./lib/database/schema.ts",
  out: "./lib/database/migrations",
  dbCredentials: {
    url: "postgresql://postgres.qnzjbouiewakhgvvqojq:IB8fdvq3sNRfvyC4@aws-0-us-west-1.pooler.supabase.com:6543/postgres",
  },
} satisfies Config;
