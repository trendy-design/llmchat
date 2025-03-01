import {
        AgentContextManager,
        AgentGraph,
        AgentGraphEvents
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";




export async function completion(
        model: ModelEnum,
        events: AgentGraphEvents,
        contextManager: AgentContextManager
): Promise<AgentGraph> {
        const graph = new AgentGraph(events, contextManager);


        graph.addNode({
                id: "initiator",
                name: "Initiator",
                role: "assistant",
                outputAsReasoning: true,
                model: model,
                systemPrompt: "You are a helpful assistant that can answer questions and help with tasks.",
                isStep: false
        });

        return graph;
}
