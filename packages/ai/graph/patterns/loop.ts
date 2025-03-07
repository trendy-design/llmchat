import { v4 as uuidv4 } from 'uuid';
import { AgentGraph } from '../agent-graph';
import { EdgeHandlerStrategy, MessageResponse } from '../edge-pattern-handlers';
import { GraphEdgeType } from '../types';



export class LoopEdgeHandler implements EdgeHandlerStrategy<'loop'> {
  constructor(private graph: AgentGraph) {}

  async handle(
    edges: GraphEdgeType<'loop'>[],
    sourceResponse: string,
    responses: MessageResponse[]
    ): Promise<string> {
    let finalResponse = sourceResponse;
    for (const edge of edges) {
      await this.graph.withFallback(edge, async () => {
        const config = edge.config ?? {};
        const maxIterations = config.maxIterations ?? 3;
        const stopCondition = config.stopCondition;
        let currentResponse = sourceResponse;
        let iterations = 0;
        const loopResponses: string[] = [currentResponse];
        const toNode = this.graph.getNode(edge.to);
        const fromNode = this.graph.getNode(edge.from);
        if (!toNode || !fromNode) return;
        while (iterations < maxIterations) {
          if (await this.graph.shouldStop(stopCondition, currentResponse)) break;
          let input = config.inputTransform
            ? await config.inputTransform({
                input: currentResponse,
                nodes: this.graph.getNodeStates(),
                query: this.graph.getContext().query,
                context: this.graph.getContext(),
                updateContext: this.graph.updateContext,
              })
            : { userMessage: currentResponse, history: [] };
          let nodeId = uuidv4();

          const toResponse = await this.graph.generate({
            nodeId,
            nodeKey: toNode.name,
            node: toNode,
            message: input.userMessage,
            type: 'text',
            history: input.history,
          });
          responses.push({ nodeId, response: toResponse });
          loopResponses.push(toResponse);
          nodeId = uuidv4();

          const fromResponse = await this.graph.generate({
            nodeId,
            nodeKey: fromNode.name,
            node: fromNode,
            message: toResponse,
            type: 'text',
            history: [],
          });
          responses.push({ nodeId, response: fromResponse });
          loopResponses.push(fromResponse);
          currentResponse = fromResponse;
          iterations++;
        }
        finalResponse = config.outputTransform
          ? String(
              await config.outputTransform({
                responses: loopResponses,
                nodes: this.graph.getNodeStates(),
                context: this.graph.getContext(),
                updateContext: this.graph.updateContext,
              })
            )
          : loopResponses.join('\n\n');
        this.graph.executionState.results.set(edge.from, finalResponse);
        this.graph.executionState.completed.add(edge.to);
        this.graph.executionState.completed.add(edge.from);
      });
    }
    return finalResponse;
  }
}
