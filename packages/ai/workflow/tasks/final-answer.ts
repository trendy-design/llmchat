import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText } from '../utils';

export const finalAnswerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
  name: 'final-answer',
  execute: async ({ trace, events, context }) => {
    console.log('final-answer');

    const question = context?.get('question') || '';
    const summaries = context?.get('summaries') || [];
    
    const prompt = `
    You are a smart final answer. Your role is to provide a final answer to the query.

    <query>
    ${question}
    </query>

    <summaries>
    ${summaries.join('\n\n')}
    </summaries>

    **Output Guidelines**
    - Write comprehensive answer to the query based on the summaries.
    `;

    events?.update('flow', (current) => ({
      ...current,
      answer: {text: "", final: false, status: 'PENDING' as const},
      final: false
    }));

    const answer = await generateText({
      prompt,
      model: ModelEnum.GEMINI_2_FLASH,
      onChunk: (chunk) => {
        events?.update('flow', (current) => ({
          ...current,
          answer: {text: chunk, final: false, status: 'PENDING' as const},
          final: false
        }));
      }
    });

    // Update typed context with the answer
    context?.update('answer', (current = []) => [...current, answer]);

    events?.update('flow', (current) => ({
      ...current,
      answer: {text: answer, final: true, status: 'COMPLETED' as const},
      final: true
    }));

    trace?.span({ 
      name: 'final-answer', 
      input: prompt, 
      output: answer, 
      metadata: context?.getAll() 
    });

    return answer;
  },
  route: ({ result }) => 'end'
}); 