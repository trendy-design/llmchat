import { AgentGraph } from '../agent-graph';
import { EdgeHandlerStrategy } from '../edge-pattern-handlers';
import { GraphEdgeType } from '../types';

type MessageResponse = {
  nodeId: string;
  response: string;
};
export class SequentialEdgeHandler implements EdgeHandlerStrategy<'sequential'> {
  constructor(private graph: AgentGraph) {}

  async handle(
    edges: GraphEdgeType<'sequential'>[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string> {
    let currentResponse = sourceResponse;
    const sorted = edges.sort((a, b) => (a.config?.priority ?? 0) - (b.config?.priority ?? 0));

    for (const edge of sorted) {
      await this.graph.withFallback(edge, async () => {
        const config = edge.config ?? {};
        const input = config.inputTransform
          ? await config.inputTransform({
              input: currentResponse,
              nodes: this.graph.getNodeStates(),
              query: this.graph.getContext().query,
            })
          : { userMessage: currentResponse, history: [] };

        await this.graph.executeNode(edge.to, input.userMessage, input.history, responses);

        const lastResponse = responses[responses.length - 1]?.response ?? '';
        currentResponse = config.outputTransform
          ? String(
              await config.outputTransform({
                responses: [currentResponse, lastResponse],
                nodes: this.graph.getNodeStates(),
              })
            )
          : lastResponse;
      });
    }

    return currentResponse;
  }
}
