import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject } from '../utils';
import {format} from 'date-fns';

export const reflectorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
  name: 'reflector',
  execute: async ({ trace, data, events, context, executionContext, config }) => {
    console.log('reflector');

    const currentGoal = data.goal;
    const lastStep = data.lastStep;
    const summary = data.summary;

    const question =    context?.get('question') || '';
    const search_queries = context?.get('search_queries');
    const summaries = context?.get('summaries');
    const current_iteration = executionContext.getTaskExecutionCount('reflector');
    const max_iteration = config?.maxIterations || 5;
    const currentDate = new Date();
    const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");

    const prompt = `
      You are a smart reflector. Your role is to reflect on the last finding and provide reasoning on what you discovered and what area further needs to be explored in order comperehensively answer the query.

      The current date and time is: **${humanizedDate}**. Use this to ensure your reasoning and search queries are up to date with the latest information.


      <user_question>
      ${question}
      </user_question>

      <existing_findings>
        <already_performed_searches>
        ${search_queries}
        </already_performed_searches>
        <searched_results>
          ${summaries}
        </searched_results>
      </existing_finding>

      **Instructions**
      - This prompt is used as part of a iterative search (current iteration: ${current_iteration}/${max_iteration}) & reflection step of a deep research ai agent, you will see existing findings under <existing_findings> section.
      - Your goal should be to act as an investigator on behalf of the user question, reason for what should be investigated in next iteration & curate new unique search queries which has not been searched before.
      - The new search queries should be your best bet to know more information to answer user questions, so it should be created with a focus by the  user_question + content which has already been searched + remaining iteration. 
      - The search queries should be short and it should use advanced search techniques.
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
      input: prompt, 
      output: object, 
      metadata: context?.getAll() 
    });

    // Update typed context with new goal and step
    context?.update('goals', (current = []) => [...current, newGoal]);
    context?.update('steps', (current = []) => [...current, newStep]);
    context?.update('search_queries', (current = []) => [
      ...current,
      ...(object.queries || [])
    ]);

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
    if (executionContext.getTaskExecutionCount('reflector') >= 5) {
      return 'final-answer';
    }
    return 'web-search';
  }
}); 