import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject } from '../utils';

export const reflectorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
  name: 'reflector',
  execute: async ({ trace, data, events, context }) => {
    console.log('reflector');

    const currentGoal = data.goal;
    const lastStep = data.lastStep;
    const summary = data.summary;
    const question =    context?.get('question') || '';

    const prompt = `
    You are a smart reflector. Your role is to reflect on the last finding and provide reasoning on what you discovered and what area further needs to be explored in order comperehensively answer the query.

    <query>
    ${question}
    </query>

    <last-finding>
    ${summary}
    </last-finding>

    **Output Guidelines**
    - Ouput JSON with the following fields:
    - Reasoning: your plan of action in 2-3 sentences like you're talking to user.
    - Queries: array of queries to perform web search on max 2 queries.
    `;

    events?.update('flow', (current) => ({
      ...current,
      goals: {
        ...(current.goals || {}),
        [currentGoal.id]: {
          ...(current?.goals?.[currentGoal.id] || {}),
          status: 'COMPLETED' as const,
        },
        [currentGoal.id + 1]: {
          text: "",
          final: false,
          status: 'PENDING' as const,
          id: currentGoal.id + 1,
        }
      }
    }));

    const object = await generateObject({
      prompt,
      model: ModelEnum.GPT_4o_Mini,
      schema: z.object({
        reasoning: z.string().optional(),
        queries: z.array(z.string()).optional()
      })
    });

    const newGoal = {
      text: object.reasoning,
      id: currentGoal.id + 1,
      final: true,
      status: 'PENDING' as const,
    }

    const newStep = {
      type: 'search',
      queries: object.queries,
      goalId: newGoal.id,
      final: true,
    }

    trace?.span({ 
      name: 'reflector', 
      input: question, 
      output: object, 
      metadata: context?.getAll() 
    });

    // Update typed context with new goal and step
    context?.update('goals', (current = []) => [...current, newGoal]);
    context?.update('steps', (current = []) => [...current, newStep]);

    // Update flow event with new goal and step
    events?.update('flow', (current) => {
      const nextStepIndex = Object.keys(current.steps || {}).length;
      return {
        ...current,
        goals: { ...(current.goals || {}), [newGoal.id]: newGoal },
        steps: { ...(current.steps || {}), [nextStepIndex]: newStep },
      };
    });

    return {
      goal: newGoal,
      step: {
        type: 'search',
        queries: object.queries,
        goalId: newGoal.id,
        final: true,
      },
    };
  },
  route: ({ result, executionContext, config }) => {
    const maxIterations = config?.maxIterations || 3;
    if (executionContext.getTaskExecutionCount('reflector') >= maxIterations) {
      return 'final-answer';
    }
    return 'web-search';
  }
}); 