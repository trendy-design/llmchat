import {
  AgentContextManager,
  AgentGraph,
  AgentGraphEvents,
  ConditionConfigArg,
  InputTransformArg,
  LLMMessageType,
  OutputTransformArg,
} from '@repo/ai';
import { ModelEnum } from '@repo/ai/models';
import { ToolEnumType } from '@repo/ai/tools';

import {
  analysisPrompt,
  analysisReflectorPrompt,
  coordinatorPrompt,
  executorPrompt,
  initiatorPrompt,
  summarizerPrompt,
} from './prompts';

export async function workflow1(
  events: AgentGraphEvents,
  contextManager: AgentContextManager
): Promise<AgentGraph> {
  const graph = new AgentGraph(events, contextManager);

  graph.addNode({
    id: 'initiator',
    name: 'Initiator',
    role: 'assistant',
    outputAsReasoning: true,
    model: ModelEnum.GPT_4o_Mini,
    systemPrompt: initiatorPrompt,
    isStep: true,
  });

  // graph.addNode({
  //   id: "clarifier",
  //   name: "Clarifier",
  //   role: "assistant",
  //   model: ModelEnum.GPT_4o_Mini,
  //   systemPrompt: clarifierPrompt,
  //   tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
  //   toolSteps: 3,
  //   isStep: true
  // });

  graph.addNode({
    id: 'executor',
    name: 'Executor',
    role: 'assistant',
    systemPrompt: executorPrompt,
    model: ModelEnum.GEMINI_2_FLASH,
    tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
    toolSteps: 3,
    isStep: true,
  });

  graph.addNode({
    id: 'coordinator',
    name: 'Coordinator',
    outputAsReasoning: true,
    role: 'assistant',
    model: ModelEnum.GPT_4o_Mini,
    systemPrompt: coordinatorPrompt,
    isStep: true,
  });

  graph.addNode({
    id: 'analysisReflector',
    name: 'Analysis Reflector',
    outputAsReasoning: true,
    role: 'assistant',
    model: ModelEnum.GPT_4o_Mini,
    systemPrompt: analysisReflectorPrompt,
    isStep: true,
  });

  graph.addNode({
    id: 'analysis',
    name: 'Analysis',
    role: 'assistant',
    model: ModelEnum.GPT_4o_Mini,
    systemPrompt: analysisPrompt,
    skipRendering: true,
    isStep: true,
  });

  graph.addNode({
    id: 'summarizer',
    name: 'Summarizer',
    role: 'assistant',
    model: ModelEnum.GEMINI_2_FLASH,
    systemPrompt: summarizerPrompt,
  });

  graph.addEdge<'sequential'>({
    from: 'initiator',
    to: 'executor',
    pattern: 'sequential',
    config: {
      priority: 1,
      inputTransform: (input: InputTransformArg) => ({ userMessage: input.input, history: [] }),
      outputTransform: (responses: OutputTransformArg) => responses.responses[0],
    },
  });

  // graph.addEdge<"sequential">({
  //   from: "clarifier",
  //   to: "executor",
  //   pattern: "sequential",
  //   config: {
  //     priority: 1,
  //     inputTransform: (input: InputTransformArg) => ({userMessage: input.input, history: []}),
  //     outputTransform: (responses: OutputTransformArg) => responses.responses[0]
  //   }
  // });

  graph.addEdge<'loop'>({
    from: 'executor',
    to: 'coordinator',
    pattern: 'loop',
    config: {
      maxIterations: 4,
      stopCondition: (condition: ConditionConfigArg) =>
        condition.response.includes(
          'Do you believe you now have enough information to craft a comprehensive answer?'
        ),
      inputTransform: (input: InputTransformArg) => {
        const initialQuery = input.query;
        const prevReasonings = input.nodes
          .filter(node => ['Coordinator'].includes(node.key))
          .map(node => node.output || '');

        const history: LLMMessageType[] = [
          ...(prevReasonings?.map((reasoning, index) => ({
            role: 'assistant' as const,
            content: reasoning ? `${reasoning}` : '',
          })) || []),
          { role: 'assistant' as const, content: `\n\nLast step findings: ${input.input}` || '' },
        ];

        return {
          userMessage: `proceed further to advance the reserch on original query: ${initialQuery}`,
          history,
        };
      },
      outputTransform: (responses: OutputTransformArg) => responses.responses?.join('\n\n'),
    },
  });

  graph.addEdge<'sequential'>({
    from: 'coordinator',
    to: 'analysis',
    pattern: 'sequential',
    config: {
      priority: 1,
      inputTransform: (input: InputTransformArg) => {
        console.log('input', input);
        const initialQuery = input.query;
        const findings = input.nodes.filter(
          node => ['Executor'].includes(node.key) && !!node.output
        );

        console.log('findings', findings);
        const history: LLMMessageType[] =
          findings?.map(finding => ({
            role: 'assistant' as const,
            content: finding.output || '',
          })) || [];
        const refinedQuery = {
          role: 'user' as const,
          content: `Analyze the above findings and prepare for writing agent to write report on: ${initialQuery}`,
        };
        return {
          userMessage: `proceed further and give acknowledgement about the analysis and what it covers`,
          history: [...history, refinedQuery],
        };
      },
      outputTransform: (responses: OutputTransformArg) => responses.responses[0],
    },
  });

  graph.addEdge<'sequential'>({
    from: 'analysis',
    to: 'analysisReflector',
    pattern: 'sequential',
    config: {
      priority: 1,
      inputTransform: (input: InputTransformArg) => {
        const initialQuery = input.query;
        const analysisOutput = input.nodes.find(node => node.key === 'Analysis')?.output;
        const history: LLMMessageType[] = [
          { role: 'assistant' as const, content: analysisOutput || '' },
        ];
        return { userMessage: `proceed further`, history };
      },
      outputTransform: (responses: OutputTransformArg) => responses.responses[0],
    },
  });

  graph.addEdge<'sequential'>({
    from: 'analysisReflector',
    to: 'summarizer',
    pattern: 'sequential',
    config: {
      priority: 1,
      inputTransform: (input: InputTransformArg) => {
        const initialQuery = input.query;
        const findings = input.nodes.filter(
          node => ['Executor'].includes(node.key) && !!node.output
        );
        const findingsMessages: LLMMessageType[] =
          findings?.map(finding => ({
            role: 'assistant' as const,
            content: `\n\n**Finding:** \n\n------------------------------------\n\n${finding.output}`,
          })) || [];

        const analysisOutput = input.nodes.find(node => node.key === 'Analysis')?.output;
        const analysisMessages: LLMMessageType[] = [
          {
            role: 'assistant' as const,
            content:
              `\n\n**Analysis**\n\n------------------------------------\n\n${analysisOutput}` || '',
          },
        ];
        return {
          userMessage: `proceed further`,
          history: [
            ...findingsMessages,
            ...analysisMessages,
            {
              role: 'assistant' as const,
              content:
                'Based on the above findings and analysis, please write a comprehensive report on the following query: ' +
                initialQuery,
            },
          ],
        };
      },
      outputTransform: (responses: OutputTransformArg) => responses.responses[0],
    },
  });

  return graph;
}
