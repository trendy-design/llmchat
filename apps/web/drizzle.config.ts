import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: './lib/database/schema.ts',
  out: './lib/database/migrations',
} satisfies Config;
