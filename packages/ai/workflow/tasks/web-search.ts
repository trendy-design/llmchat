import { format } from 'date-fns';
import { ModelEnum } from '../../models';
import { executeWebSearch } from '../../tools/web-search';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText } from '../utils';
export const webSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
  name: 'web-search',
  execute: async ({ data, trace, events, context }) => {
    console.log('web-search');

    const remainingPlan = context?.get('remainingPlan') || [];
    const currentQuery = remainingPlan[0];
    console.log("Query", currentQuery);

    const webSearchResults = await executeWebSearch([currentQuery.query]);
    const webSearchPurpose = currentQuery.purpose;
    const currentDate = new Date();
    const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");
    const question = context?.get('question') || '';

    const goal = {

    }

    const goalId = String(Object.keys(events?.getState('flow')?.goals || {}).length);
    const stepId = String(Object.keys(events?.getState('flow')?.steps || {}).length);

    events?.update('flow', (current) => {
      return {
        ...current,
        goals: {
          ...(current.goals || {}),
          [goalId]: {
            id: Number(goalId),
            text: currentQuery.purpose,
            final: false,
            status: 'PENDING' as const,
          }
        },
        steps: {
          ...(current.steps || {}),
          [stepId]: {
            id: Number(stepId),
            type: 'search',
            goalId: Number(goalId),
            final: false,
            status: 'PENDING' as const,
            queries: [currentQuery.query],
          }
        },
        final: false
      };
    });




    const prompt = `
Role: You are a Research Information Processor. Your task is to clean and format web search results without summarizing or condensing the information.

The current date and time is: **${humanizedDate}**.

<user_question>
${question}
</user_question>

**Web Search Results**
${webSearchResults.map((result) => `<web-search-results>\n\n - ${result.title}: ${result.link} \n\n ${result.content} \n\n</web-search-results>`).join('\n')}

<processing_guidelines>
- Do NOT summarize or condense the information
- Preserve all relevant details, facts, data points, examples, and explanations from the search results
- Remove only duplicate content, irrelevant advertisements, navigation elements, or other web artifacts
- Maintain the original depth and breadth of information
- Organize the information in a clean, readable format
- Present multiple perspectives or approaches when they exist in the sources
</processing_guidelines>

<output_format>
- Present the full detailed information in a clean, readable format
- Use headings or sections only when they help organize complex information
- Include all source links and properly attribute information using [Source X] notation
- Focus on preserving comprehensive information rather than summarizing
</output_format>

      `

    const summary = await generateText({
      model: ModelEnum.GEMINI_2_FLASH,
      prompt,

    })

    console.log("Summary", summary);

    events?.update('flow', (current) => {
        const stepId = String(Object.keys(current.steps || {}).length);
      return {
        ...current,
        goals: {
          ...(current.goals || {}),
          [goalId]: {
            ...(current.goals?.[goalId] || {}),
            status: 'COMPLETED' as const,
          } as any
        },
        steps: {
          ...(current.steps || {}),
          [stepId]: {
            ...(current.steps?.[stepId] || {}),
            type: 'read',
            final: true,
            goalId: Number(goalId),
            status: 'COMPLETED' as const,
            results: webSearchResults,
          }
        }
      }
    })


    trace?.span({
      name: 'web-search',
      input: prompt,
      output: summary,
      metadata: {
        remainingPlan,
        currentQuery,
        webSearchResults,
        webSearchPurpose,
      }
    })

    const updatedRemainingPlan = remainingPlan.slice(1);
    
    context?.update('remainingPlan', (current) => updatedRemainingPlan || []);

    context?.update('summaries', (current) => [...(current ?? []), `**${currentQuery.query}**\n[${currentQuery.purpose}] \n\n ${summary}`]);




    
    return {
        remainingPlan: updatedRemainingPlan,
        summary,
    };
  },
  route: ({ result }) => {
    if (result?.remainingPlan?.length > 0) {
      return 'web-search';
    }
    return 'final-answer';
  }
}); 