import { ChatMode } from '@repo/shared/config';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';

export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'router',
    execute: async ({ context, redirectTo }) => {
        const mode = context?.get('mode') || ChatMode.Fast;

        if (mode === ChatMode.Deep) {
            redirectTo('refine-query');
        } else {
            redirectTo('completion');
        }
    },
});
