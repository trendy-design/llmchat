import { trimMessageHistoryEstimated } from '@repo/ai/models';
import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { WorkflowEventSchema } from '@repo/shared/types';
import { WorkflowContextSchema } from '../flow';
import { handleError, sendEvents } from '../utils';
export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'router',
    execute: async ({ events, context, redirectTo }) => {
        const mode = context?.get('mode') || ChatMode.GEMINI_2_FLASH;
        const { updateStatus } = sendEvents(events);

        const hasWebSearch = context?.get('webSearch') || false;

        const messageHistory = context?.get('messages') || [];
        const trimmedMessageHistory = trimMessageHistoryEstimated(messageHistory, mode);
        context?.set('messages', trimmedMessageHistory.trimmedMessages ?? []);

        if (!trimmedMessageHistory?.trimmedMessages) {
            throw new Error('Maximum message history reached');
        }

        updateStatus('PENDING');

        if (mode === ChatMode.Deep) {
            redirectTo('refine-query');
        } else if (mode === ChatMode.Pro) {
            redirectTo('pro-search');
        } else if (mode === ChatMode.Agent) {
            redirectTo('agentic');
        } else if (hasWebSearch) {
            redirectTo('quickSearch');
        } else {
            redirectTo('completion');
        }
    },
    onError: handleError,
});
