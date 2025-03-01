import {
  AgentContextManager,
  AgentGraph,
  AgentGraphEvents,
  InputTransformArg,
  LLMMessageType,
  OutputTransformArg
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";
import { ToolEnumType } from "@repo/ai/tools";
      
      export async function webSearchWorkflow(
        events: AgentGraphEvents,
        contextManager: AgentContextManager
      ): Promise<AgentGraph> {
        const graph = new AgentGraph(events, contextManager);
      
        graph.addNode({
          id: "searcher",
          name: "Searcher",
          role: "assistant",
          model: ModelEnum.GEMINI_2_FLASH,
          systemPrompt: "You are a deep research expert. Search the web to find relevant information about the user's query and related queries to the user's query. Focus on finding factual and up-to-date information. and after searching write detailed report of the search results. Cite each statement using <Source>URL</Source> tag with the actual source URL.",
          tools: [ToolEnumType.SEARCH],
          toolSteps: 4,
          isStep: true
        });
      
        graph.addNode({
          id: "summarizer",
          name: "Summarizer",
          role: "assistant",
          model: ModelEnum.GEMINI_2_FLASH,
          systemPrompt: "You are a Research Writer. Create a indepth report of the search results, highlighting the most important information. Let content decide the structure of the report. Cite each statement using <Source>URL</Source> tag with the actual source URL."
        });
      
        graph.addEdge<"sequential">({
          from: "searcher",
          to: "summarizer",
          pattern: "sequential",
          config: {
            priority: 1,
            inputTransform: (input: InputTransformArg) => {
                const initialQuery = input.query;
                const prevResults = input.nodes
                    .filter(node => ["Searcher"].includes(node.key))
                    .map(node => node.output || "");

                const history: LLMMessageType[] = [...(prevResults?.map((result, index) => ({role: "assistant" as const, content: result})) || []), {role: "assistant" as const, content: `\n\nLast step findings: ${input.input}`}];
                
                return {userMessage: `Based on the previous search results, analyze it and proceed further with the user's original query: ${initialQuery}. Cite each statement using <Source>URL</Source> tag with the actual source URL.`, history};
            },
            outputTransform: (responses: OutputTransformArg) => responses.responses[0]
          }
        });
      
        return graph;
      }