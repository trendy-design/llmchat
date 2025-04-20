import { baseEnvSchema, createEnv, loadEnv, z } from '../index';

/**
 * Example of loading environment variables from multiple files
 *
 * Assuming the following files exist:
 *
 * .env - Base settings
 * .env.development - Development-specific settings (overwrites base)
 * .env.local - Local overrides (overwrites both)
 */

// First, load environment variables from appropriate files
// This will respect the loading order: base -> development -> local
loadEnv(['base', 'development']);

// Then create the environment schema
const envSchema = z.object({
    ...baseEnvSchema,

    // API configuration
    API_URL: z.string().url(),
    API_TIMEOUT: z.coerce.number().positive().default(5000),

    // Authentication
    AUTH_SECRET: z.string().min(16),
    AUTH_EXPIRY: z.coerce.number().positive().default(86400),

    // Database (different between environments)
    DATABASE_URL: z.string().url(),

    // Feature flags that might be in .env.local
    ENABLE_BETA_FEATURES: z
        .preprocess(val => val === 'true' || val === '1', z.boolean())
        .default(false),
});

// Create the typesafe environment object
export const env = createEnv(envSchema);

// Application initialization
function initializeApp() {
    // The environment variables are now loaded from all relevant files
    console.log(`Starting application in ${env.NODE_ENV} mode`);
    console.log(`API URL: ${env.API_URL}`);
    console.log(`Database URL: ${env.DATABASE_URL}`);

    if (env.ENABLE_BETA_FEATURES) {
        console.log('Beta features are enabled - this might be from .env.local');
    }
}

// Run the initialization
initializeApp();
