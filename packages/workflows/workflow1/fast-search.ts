import {
        AgentContextManager,
        AgentGraph,
        AgentGraphEvents,
        GraphStateManager
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";
import { z } from "zod";



export async function fastSearchWorkflow(
        events: AgentGraphEvents,
        contextManager: AgentContextManager,
        stateManager: GraphStateManager,
        abortController: AbortController
): Promise<AgentGraph> {
        const graph = new AgentGraph(events, contextManager, stateManager, abortController);

        graph.addNode({
                id: "initiator",
                name: "Initiator",
                role: "assistant",
                outputAsReasoning: true,
                model: ModelEnum.GPT_4o_Mini,
                systemPrompt: `You're planning agent with analytical skills. You're given a query breakdown query into 3 sub queries to answer the query.`,
                outputMode: 'object',
                outputSchema: z.object({
                        queries: z.array(z.string()).max(3)
                }),
                isStep: true
        });

        graph.addNode({
                id: "executor",
                name: "Executor",
                role: "assistant",
                systemPrompt: `You're an assistant that answers questions. You're given a query and a list of sub queries to answer the query.`,
                outputMode: 'text',
        });




        return graph;
}
