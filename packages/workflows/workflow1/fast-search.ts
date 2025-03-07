import {
        AgentContextManager,
        AgentGraph,
        AgentGraphEvents,
        GraphStateManager,
        InputTransformArg,
        LLMMessageType,
        OutputTransformArg
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";
import { ToolEnumType } from "@repo/ai/tools";

import { citationPrompt } from "./prompts";


export async function fastSearchWorkflow(
        events: AgentGraphEvents,
        contextManager: AgentContextManager,
        stateManager: GraphStateManager,
        abortController: AbortController
): Promise<AgentGraph> {
        const graph = new AgentGraph({name: "fast-search", events, contextManager, stateManager, abortController});


        graph.addNode({
                id: "initiator",
                name: "Initiator",
                role: "assistant",
                model: ModelEnum.GPT_4o_Mini,
                systemPrompt: `You're planning agent with analytical skills. You're given a query breakdown query into 3 sub queries and search the web for the most relevant information. and give detailed report on the search results. \n\n ${citationPrompt}`,
                tools: [ToolEnumType.SEARCH],
                isStep: true,
                toolSteps: 2,
                outputMode: 'text',

        });

        graph.addNode({
                id: "executor",
                name: "Executor",
                role: "assistant",
                systemPrompt: `You're an assistant that answers questions. You're given a query and a list of sub queries to answer the query.`,
                outputMode: 'text',
        });

        graph.addEdge<"sequential">({
                from: "initiator",
                to: "executor",
                pattern: "sequential",
                config: {
                  priority: 1,
                  inputTransform: (input: InputTransformArg) => {
                        const initialQuery = input.query;
                        const prevSerchResult = input.nodes 
                          .filter((node) => ["Initiator"].includes(node.key))
                          .map((node) => node.output || "")
                        
                        const history:LLMMessageType[] = [...(prevSerchResult?.map((reasoning, index) => ({role: "assistant" as const, content: reasoning })))]
                
                        return {userMessage: `proceed further write report on: ${initialQuery}`, history};
                  },
                  outputTransform: (responses: OutputTransformArg) => responses.responses[0]
                }
              });
        




        return graph;
}
