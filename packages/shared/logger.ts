import * as Sentry from '@sentry/node';

// Initialize Sentry only in production
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // Sample only 10% of transactions
        profilesSampleRate: 0.05, // Profile only 5% of transactions
    });
}

type LogContext = Record<string, any>;

export const logger = {
    // Only capture critical errors in Sentry
    error: (message: string, error?: any, context: LogContext = {}) => {
        console.error(message, error, context);

        if (process.env.NODE_ENV === 'production') {
            if (error instanceof Error) {
                Sentry.captureException(error, {
                    extra: { ...context, message },
                });
            } else {
                Sentry.captureException(new Error(message), {
                    extra: { ...context, originalError: error },
                });
            }
        }
    },

    // For important operational events - not sent to Sentry
    info: (message: string, context: LogContext = {}) => {
        console.log(message, context);
    },

    // For potential issues that aren't errors
    warn: (message: string, context: LogContext = {}) => {
        console.warn(message, context);
        // Only send warnings to Sentry if they might need attention
        if (process.env.NODE_ENV === 'production' && context.important) {
            Sentry.captureMessage(message, {
                level: 'warning',
                extra: context,
            });
        }
    },

    // Only use locally, never in production
    debug: (message: string, context: LogContext = {}) => {
        if (process.env.LOG_LEVEL === 'debug') {
            console.debug(message, context);
        }
    },
};
