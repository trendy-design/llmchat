import { baseEnvSchema, createEnv, optional, z } from '../index';

// Define environment-specific schema parts
const developmentSchema = {
    DEBUG: z.preprocess(val => val === 'true' || val === '1', z.boolean()).default(true),
    MOCK_SERVICES: z.preprocess(val => val === 'true' || val === '1', z.boolean()).default(true),
};

const productionSchema = {
    APM_SERVICE_TOKEN: z.string().min(1),
    SENTRY_DSN: z.string().url(),
    CACHE_STRATEGY: z.enum(['memory', 'redis']).default('redis'),
};

// Create a shared schema regardless of environment
const commonSchema = {
    ...baseEnvSchema,

    // Core configuration required in all environments
    APP_NAME: z.string().default('my-api'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Database configuration with connection pool settings
    DATABASE_URL: z.string().url(),
    DB_CONNECTION_LIMIT: z.coerce.number().positive().default(10),
    DB_IDLE_TIMEOUT: z.coerce.number().positive().default(10000),

    // Authentication
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRY: z.coerce.number().positive().default(3600),

    // External service integration
    REDIS_URL: optional(z.string().url()),
    S3_BUCKET: optional(z.string()),
    S3_REGION: optional(z.string()),

    // API rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
};

// Create the appropriate schema based on NODE_ENV
const envSchema =
    process.env.NODE_ENV === 'production'
        ? z.object({ ...commonSchema, ...productionSchema })
        : z.object({ ...commonSchema, ...developmentSchema });

// Create the typesafe environment object
export const env = createEnv(envSchema);

// Type for the environment-specific features
type Env = z.infer<typeof envSchema>;

// Usage example in a server configuration context
function configureServer() {
    // Configure logging based on environment
    console.log(`Starting ${env.APP_NAME} in ${env.NODE_ENV} mode`);
    console.log(`Log level set to ${env.LOG_LEVEL}`);

    // Database connection with pool configuration
    const dbConfig = {
        url: env.DATABASE_URL,
        connectionLimit: env.DB_CONNECTION_LIMIT,
        idleTimeout: env.DB_IDLE_TIMEOUT,
    };
    console.log('Database configuration:', dbConfig);

    // Rate limiting configuration
    const rateLimitConfig = {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    };
    console.log('Rate limiting:', rateLimitConfig);

    // Environment-specific features
    if (env.NODE_ENV === 'development') {
        // TypeScript knows these properties exist only in development
        if ('DEBUG' in env && env.DEBUG) {
            console.log('Debug mode enabled');
        }
        if ('MOCK_SERVICES' in env && env.MOCK_SERVICES) {
            console.log('Using mocked external services');
        }
    } else {
        // TypeScript knows these properties exist only in production
        if ('APM_SERVICE_TOKEN' in env) {
            console.log(`APM monitoring enabled: ${!!env.APM_SERVICE_TOKEN}`);
        }
        if ('CACHE_STRATEGY' in env) {
            console.log(`Cache strategy: ${env.CACHE_STRATEGY}`);
        }
    }
}

// This would error if required env variables are missing
configureServer();
