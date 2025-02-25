import type { AgentGraph } from './agent-graph';
import { LoopEdgeHandler } from './patterns/loop';
import { SequentialEdgeHandler } from './patterns/sequential';
import type { GraphEdgePatternType, GraphEdgeType } from './types';

type MessageResponse = {
  nodeId: string;
  response: string;
};

export type EdgeHandlerStrategy<T extends GraphEdgePatternType> = {
  handle(
    edges: GraphEdgeType<T>[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string>;
};

export function createEdgeHandlerStrategies(
  graph: AgentGraph
): Map<GraphEdgePatternType, EdgeHandlerStrategy<any>> {
  return new Map<GraphEdgePatternType, EdgeHandlerStrategy<any>>([
    ['sequential', new SequentialEdgeHandler(graph)],
    ['loop', new LoopEdgeHandler(graph)],
  ]);
}

// class RevisionEdgeHandler implements EdgeHandlerStrategy<'revision'> {
//   constructor(private graph: AgentGraph) {
//   }

//   async handle(
//     edges: GraphEdgeType<'revision'>[],
//     sourceResponse: string,
//     responses: MessageResponse[]
//   ): Promise<string> {
//     let finalResponse = sourceResponse;
//     for (const edge of edges) {
//       await this.graph.withFallback(edge, async () => {
//         const config = edge.config ?? {};
//         const maxIterations = config.maxIterations ?? 3;
//         const stopCondition = config.stopCondition;
//         const revisionPrompt = config.revisionPrompt ?? ((input: { response: string; nodes: NodeState[] }) =>
//           `Please review and improve the following response: ${input.response}`);

//         let currentResponse = sourceResponse;
//         let iterations = 0;
//         while (iterations < maxIterations) {
//           if (await this.graph.shouldStop(stopCondition, currentResponse)) break;
//           const nextNode = this.graph.getNode(edge.to);
//           if (!nextNode) break;
//           const nodeId = uuidv4();
//           let reasoningForRevision = '';
//           if (nextNode.enableReasoning) {
//             reasoningForRevision = await this.graph.processReasoningStep(nextNode, currentResponse);
//             this.graph.events.emit('event', {
//               nodeId,
//               nodeKey: nextNode.name,
//               status: 'pending',
//               nodeStatus: 'reasoning',
//               nodeReasoning: reasoningForRevision,
//               content: reasoningForRevision
//             });
//           }
//           const promptInput = reasoningForRevision
//             ? `${reasoningForRevision}\n\n${await revisionPrompt({ response: currentResponse, nodes: this.graph.getNodeStates() })}`
//             : await revisionPrompt({ response: currentResponse, nodes: this.graph.getNodeStates() });
//           currentResponse = await this.graph.processAgentMessage(
//             nodeId,
//             nextNode.name,
//             nextNode,
//             promptInput,
//             'text'
//           );
//           responses.push({ nodeId, response: currentResponse });
//           iterations++;
//         }
//         finalResponse = currentResponse;
//         this.graph.executionState.results.set(edge.to, currentResponse);
//         this.graph.executionState.completed.add(edge.to);
//       });
//     }
//     return finalResponse;
//   }
// }

// class ParallelEdgeHandler implements EdgeHandlerStrategy<'parallel'> {
//   constructor(private graph: AgentGraph) {}

//   async handle(
//     edges: GraphEdgeType<'parallel'>[],
//     sourceResponse: string,
//     responses: MessageResponse[]
//   ): Promise<string> {
//     await Promise.all(
//       edges.map(edge =>
//         this.graph.withFallback(edge, () => this.graph.executeNode(edge.to, sourceResponse, responses))
//       )
//     );
//     return sourceResponse;
//   }
// }

// class MapEdgeHandler implements EdgeHandlerStrategy<'map'> {
//   constructor(private graph: AgentGraph) {}

//   async handle(
//     edges: GraphEdgeType<'map'>[],
//     sourceResponse: string,
//     responses: MessageResponse[]
//   ): Promise<string> {
//     for (const edge of edges) {
//       await this.graph.withFallback(edge, async () => {
//         const inputs = edge.config?.inputTransform
//           ? await edge.config.inputTransform({ input: sourceResponse, nodes: this.graph.getNodeStates() })
//           : [sourceResponse];
//         const mappedResponses: string[] = [];
//         await Promise.all(
//           inputs.map(async input => {
//             const nextNode = this.graph.getNode(edge.to);
//             if (!nextNode) return;
//             const nodeId = uuidv4();
//             let reasoningForMap = '';
//             if (nextNode.enableReasoning) {
//               reasoningForMap = await this.graph.processReasoningStep(nextNode, input);
//               this.graph.events.emit('event', {
//                 nodeId,
//                 nodeKey: nextNode.name,
//                 status: 'pending',
//                 nodeStatus: 'reasoning',
//                 nodeReasoning: reasoningForMap,
//                 content: reasoningForMap
//               });
//             }
//             const mapped = await this.graph.processAgentMessage(
//               nodeId,
//               nextNode.name,
//               nextNode,
//               reasoningForMap ? `${reasoningForMap}\n\n${input}` : input,
//               'text'
//             );
//             mappedResponses.push(mapped);
//           })
//         );
//         const finalResponse = edge.config?.outputTransform
//           ? await edge.config.outputTransform({ responses: mappedResponses, nodes: this.graph.getNodeStates() })
//           : mappedResponses.join('\n');
//         responses.push({ nodeId: edge.to, response: finalResponse });
//         this.graph.executionState.results.set(edge.to, finalResponse);
//         this.graph.executionState.completed.add(edge.to);
//       });
//     }
//     return sourceResponse;
//   }
// }

// class ReduceEdgeHandler implements EdgeHandlerStrategy<'reduce'> {
//   constructor(private graph: AgentGraph) {}

//   async handle(
//     edges: GraphEdgeType<'reduce'>[],
//     sourceResponse: string,
//     responses: MessageResponse[]
//   ): Promise<string> {
//     for (const edge of edges) {
//       await this.graph.withFallback(edge, async () => {
//         const inputNodes = this.graph.getInputNodes(edge.to);
//         const inputResponses = inputNodes.map(id => this.graph.executionState.results.get(id) ?? '');
//         const reduced = edge.config?.outputTransform
//           ? await edge.config.outputTransform({ responses: inputResponses, nodes: this.graph.getNodeStates() })
//           : inputResponses.join('\n');
//         await this.graph.executeNode(edge.to, reduced, responses);
//       });
//     }
//     return sourceResponse;
//   }
// }

// class ConditionEdgeHandler implements EdgeHandlerStrategy<'condition'> {
//   constructor(private graph: AgentGraph) {}

//   async handle(
//     edges: GraphEdgeType<'condition'>[],
//     sourceResponse: string,
//     responses: MessageResponse[]
//   ): Promise<string> {
//     for (const edge of edges) {
//       if (edge.config?.condition?.({ response: sourceResponse, nodes: this.graph.getNodeStates() })) {
//         await this.graph.withFallback(edge, () => this.graph.executeNode(edge.to, sourceResponse, responses));
//       }
//     }
//     return sourceResponse;
//   }
// }
