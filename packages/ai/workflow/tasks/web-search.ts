import { executeWebSearch } from '../../tools/web-search';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';

export const webSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
  name: 'web-search',
  execute: async ({ data, trace, events, context }) => {
    console.log('web-search');

    const currentGoal = data.goal;
    const lastStep = data.step;

    const queries = lastStep.queries;

    const webSearchResults = await executeWebSearch(queries);

    trace?.span({
      name: 'web-search',
      input: queries,
      output: webSearchResults,
      metadata: {
        queries,
      }
    });

    const step = {
      type: 'read',
      results: webSearchResults?.map((result) => ({
        title: result.title,
        link: result.link,
      })),
      goalId: currentGoal.id,
      final: true,
    }

    context?.update('steps', (current = []) => [...current, step]);
    events?.update('flow', (current) => {
      const nextStepIndex = Object.keys(current.steps || {}).length;
      return {
        ...current,
        steps: { ...(current.steps || {}), [nextStepIndex]: step },
      };
    });
    
    return {
        goal: currentGoal,
        step,
        webSearchResults,
    };
  },
  route: ({ result }) => 'web-search-summary'
}); 