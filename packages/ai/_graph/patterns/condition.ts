import { v4 as uuidv4 } from 'uuid';
import { AgentGraph } from '../agent-graph';
import { EdgeHandlerStrategy, MessageResponse } from '../edge-pattern-handlers';
import { GraphEdgeType } from '../types';

export class ConditionEdgeHandler implements EdgeHandlerStrategy<'condition'> {
  constructor(private graph: AgentGraph) {}

  async handle(
    edges: GraphEdgeType<'condition'>[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string> {
    let finalResponse = sourceResponse;
    
    for (const edge of edges) {
      await this.graph.withFallback(edge, async () => {
        const config = edge.config ?? {};
        const condition = config.condition;
        
        const conditionResult = condition 
          ? await condition({
              response: sourceResponse,
              nodes: this.graph.getNodeStates()
            })
          : false;
        
        const targetNodeId = conditionResult ? edge.trueBranch : edge.falseBranch;
        
        if (!targetNodeId) return;
        
        const targetNode = this.graph.getNode(targetNodeId);
        if (!targetNode) return;
        
        const input = config.inputTransform
          ? await config.inputTransform({
              input: sourceResponse,
              nodes: this.graph.getNodeStates(),
              query: this.graph.getContext().query,
              context: this.graph.getContext(),
              updateContext: this.graph.updateContext,
            })
          : { userMessage: sourceResponse, history: [] };
        
        const nodeId = uuidv4();
        
        const targetResponse = await this.graph.generate({
          nodeId,
          nodeKey: targetNode.name,
          node: targetNode,
          message: input.userMessage,
          type: 'text',
          history: input.history,
        });
        
        responses.push({ nodeId, response: targetResponse });
        
        finalResponse = config.outputTransform
          ? String(
              await config.outputTransform({
                responses: [sourceResponse, targetResponse],
                nodes: this.graph.getNodeStates(),
                context: this.graph.getContext(),
                updateContext: this.graph.updateContext,
              })
            )
          : targetResponse;
        
        this.graph.executionState.results.set(edge.from, finalResponse);
        this.graph.executionState.completed.add(targetNodeId);
      });
    }
    
    return finalResponse;
  }
} 