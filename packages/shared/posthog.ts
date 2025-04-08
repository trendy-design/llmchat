import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';

const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
});

export enum EVENT_TYPES {
    WORKFLOW_SUMMARY = 'workflow_summary',
}

export type PostHogEvent = {
    event: EVENT_TYPES;
    userId: string;
    properties: Record<string, any>;
};

export const posthog = {
    capture: (event: PostHogEvent) => {
        client.capture({
            distinctId: event?.userId || uuidv4(),
            event: event.event,
            properties: event.properties,
        });
    },
    flush: () => {
        client.flush();
    },
};
