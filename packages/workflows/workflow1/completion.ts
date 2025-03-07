import {
        AgentContextManager,
        AgentGraph,
        AgentGraphEvents,
        GraphStateManager
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";




export async function completion(
        model: ModelEnum,
        events: AgentGraphEvents,
        contextManager: AgentContextManager,
        stateManager: GraphStateManager,
        abortController: AbortController
): Promise<AgentGraph> {
        const graph = new AgentGraph({name: "completion", events, contextManager, stateManager, abortController});


        graph.addNode({
                id: "initiator",
                name: "Initiator",
                role: "assistant",
                outputAsReasoning: false,
                model: model,
                systemPrompt: "You are a helpful assistant that can answer questions and help with tasks.",
                isStep: false
        });

        return graph;
}
