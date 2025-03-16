import { format } from 'date-fns';
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
    const currentDate = new Date();
    const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");
    
    const prompt = `
You are a Comprehensive Research Analyst tasked with providing an extremely detailed and thorough response to a question about "${question}".

Your goal is to create a comprehensive report based on the research information provided.

First, carefully read and analyze the following research information:

<research_findings>
${summaries.map((summary) => `<finding>${summary}</finding>`).join('\n')}
</research_findings>

## Report Requirements:

1. Structure and Organization:
   - Organize information thematically
   - Use a consistent hierarchy
   - Begin with a summary of key developments
   - End with an analytical conclusion that identifies trends and future implications

2. Content and Analysis:
   - Provide technical details about capabilities, architectures, and performance metrics
   - Analyze the significance of each development within the broader industry context
   - Make connections between related developments across different companies
   - Maintain an objective, analytical tone throughout

3. Citations and References:
   - Use numbered inline citations [1], [2], etc. when referencing specific information
   - Include a comprehensive, numbered reference list at the end with full source URLs
   - Cite multiple sources when information appears in multiple research summaries

4. Formatting:
   - Use **bold text** for key figures and key information
   - Maintain consistent paragraph length and structure
   - use few unnecessary headings, bullet points, or lists, shouldn't be too many subsections
   - Use bullet points sparingly and only for truly list-worthy content
   - Use markdown tables where appropriate
   - Ensure proper spacing between sections for readability

Your report should demonstrate expert knowledge of the AI field while remaining accessible to informed readers. Focus on providing substantive analysis rather than simply summarizing announcements.

    `;

    const answer = await generateText({
      prompt,
      model: ModelEnum.Claude_3_7_Sonnet,
      onChunk: (chunk) => {
        events?.update('flow', (current) => ({
          ...current,
          answer: {text: chunk, final: false, status: 'PENDING' as const},
          final: false
        }));
      }
    });

    console.log("Answer", answer);

    // Update typed context with the answer
    context?.update('answer', (current = []) => [...current, answer]);

    events?.update('flow', (current) => ({
      ...current,
      answer: {text: answer, final: true, status: 'COMPLETED' as const},
      final: true
    }));

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