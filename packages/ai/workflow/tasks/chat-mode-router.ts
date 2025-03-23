import { CompletionMode, WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';


export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'router',
        execute: async ({context, redirectTo }) => {

                const mode = context?.get('mode') || CompletionMode.Fast;
               
                if (mode === CompletionMode.Deep) {
                        redirectTo('refine-query');
                }
                else{
                        redirectTo('completion');
                }

        }
});



