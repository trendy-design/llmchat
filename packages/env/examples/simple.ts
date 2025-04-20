import { baseEnvSchema, createEnv, z } from '../index';

/**
 * Example of a basic environment configuration
 */
export const env = createEnv(
    z.object({
        // Use the base schema for common variables
        ...baseEnvSchema,

        // Database configuration
        DATABASE_URL: z.string().url(),

        // API keys and secrets
        JWT_SECRET: z.string().min(32),
        OPENAI_API_KEY: z.string().min(1),

        // Feature flags
        ENABLE_ANALYTICS: z
            .preprocess(val => val === 'true' || val === '1', z.boolean())
            .default(false),

        // Numeric configurations
        RATE_LIMIT: z.coerce.number().positive().default(100),
        SESSION_TTL: z.coerce.number().positive().default(3600),
    })
);

// Usage examples:
function configureDatabase() {
    // TypeScript knows this is a string URL
    const dbUrl = env.DATABASE_URL;
    console.log(`Connecting to database at ${dbUrl}`);

    // The PORT from baseEnvSchema is available
    console.log(`Server will run on port ${env.PORT}`);

    // Feature flags with defaults work as expected
    if (env.ENABLE_ANALYTICS) {
        console.log('Analytics are enabled');
    }
}

// This would error if env variables are missing or invalid
configureDatabase();
