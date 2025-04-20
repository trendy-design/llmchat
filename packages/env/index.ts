import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { join } from 'path';
import { z } from 'zod';

/**
 * Creates a typesafe environment variable validator using Zod
 */
export function createEnv<T extends z.ZodType>(schema: T) {
    // Load environment variables from .env file
    dotenv.config();

    // Parse the environment variables with the provided schema
    const parsed = schema.safeParse(process.env);

    // If validation fails, throw error with details
    if (!parsed.success) {
        console.error(
            '❌ Invalid environment variables:',
            JSON.stringify(parsed.error.format(), null, 2)
        );
        throw new Error('Invalid environment variables');
    }

    return parsed.data as z.infer<T>;
}

/**
 * Load environment variables from .env files with support for different environments
 * Example: loadEnv(['base', 'development'], '/app/root')
 */
export function loadEnv(envNames: string[] = ['development'], rootPath?: string): void {
    const root = rootPath || process.cwd();

    // First load the .env file if it exists
    const defaultEnvPath = join(root, '.env');
    if (fs.existsSync(defaultEnvPath)) {
        dotenv.config({ path: defaultEnvPath });
    }

    // Then load environment-specific files in the provided order
    for (const name of envNames) {
        const envPath = join(root, `.env.${name}`);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true });
        }
    }

    // Finally, load local overrides if they exist
    const localEnvPath = join(root, '.env.local');
    if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath, override: true });
    }
}

/**
 * Utility function to create optional env vars with defaults
 */
export function optional<T extends z.ZodTypeAny>(schema: T, defaultValue?: z.infer<T>) {
    return z
        .union([schema, z.undefined()])
        .transform(val => (val === undefined ? defaultValue : val));
}

/**
 * Common schema parts for reuse
 */
export const baseEnvSchema = {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
};

/**
 * Base environment type derived from the schema
 */
export type BaseEnv = {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
};

/**
 * Generic environment type helper
 */
export type Env<T extends z.ZodType> = z.infer<T>;

/**
 * Re-export zod for convenience
 */
export { z } from 'zod';
