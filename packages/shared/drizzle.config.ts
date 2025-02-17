import { Config } from 'drizzle-kit';

export default {
  schema: '../shared/schema',
  out: './src/migrations',
  dialect: 'postgresql',
} satisfies Config;
