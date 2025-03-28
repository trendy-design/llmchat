import { ChatMode } from '@repo/shared/config';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';

export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'router',
    execute: async ({ context, redirectTo }) => {
        const mode = context?.get('mode') || ChatMode.GEMINI_2_FLASH;

        if (mode === ChatMode.Deep) {
            redirectTo('refine-query');
        } else if (mode === ChatMode.Pro) {
            redirectTo('pro-search');
        } else {
            redirectTo('completion');
        }
    },
});
