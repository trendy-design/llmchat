import { LanguageModelV1, Tool, generateObject, streamText } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import { ToolEnumType, aiSdkTools } from '../tools';
import type { AgentContextManager } from './agent-context-manager';
import type { AgentGraphEvents } from './agent-graph-events';
import { GraphNode } from './agent-node';
import { EdgeHandlerStrategy, createEdgeHandlerStrategies } from './edge-pattern-handlers';
import type {
  AgentContextType,
  ConditionConfigArg,
  EdgeExecutionState,
  GraphEdgePatternType,
  GraphEdgeType,
  LLMMessageType,
  NodeState,
  ToolCallResultType,
  ToolCallType,
} from './types';

type MessageResponse = { nodeId: string; response: string };

type GraphState = {
  nodes: Map<string, NodeState>;
  currentExecution: {
    startTime: number;
    nodeStates: Map<string, NodeState>;
    executionPath: string[];
  };
  executionHistory: {
    startTime: number;
    endTime: number;
    duration: number;
    nodeStates: Map<string, NodeState>;
    executionPath: string[];
    input: string;
    finalOutput?: string;
  }[];
};

export class AgentGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdgeType<GraphEdgePatternType>[] = [];
  public events: AgentGraphEvents;
  protected contextManager: AgentContextManager;
  protected defaultProvider: LanguageModelV1;
  public executionState: EdgeExecutionState;
  protected graphState: GraphState;
  protected edgeHandlerStrategies: Map<GraphEdgePatternType, EdgeHandlerStrategy<any>>;

  // Change or make configurable as desired
  private STREAM_TIMEOUT_MS = 60000;

  constructor(events: AgentGraphEvents, contextManager: AgentContextManager) {
    this.events = events;
    this.contextManager = contextManager;
    this.defaultProvider = getLanguageModel(contextManager.getContext().model);
    this.executionState = {
      pending: new Set(),
      completed: new Set(),
      results: new Map(),
    };
    this.graphState = {
      nodes: new Map(),
      currentExecution: {
        startTime: 0,
        nodeStates: new Map(),
        executionPath: [],
      },
      executionHistory: [],
    };
    this.edgeHandlerStrategies = createEdgeHandlerStrategies(this);
  }

  /* ------------------------- Node and Edge Management ------------------------- */

  addNode(nodeConfig: {
    id: string;
    name: string;
    role: string;
    systemPrompt: string;
    temperature?: number;
    metadata?: Record<string, any>;
    tools?: ToolEnumType[];
    toolSteps?: number;
    enableReasoning?: boolean;
    reasoningPrompt?: string;
    model?: ModelEnum;
    maxTokens?: number;
    outputAsReasoning?: boolean;
    skipRendering?: boolean;
    isStep?: boolean;
  }): void {
    this.nodes.set(nodeConfig.id, new GraphNode(nodeConfig));
  }

  addEdge<T extends GraphEdgePatternType>(edgeConfig: GraphEdgeType<T>): void {
    if (!this.nodes.has(edgeConfig.from) || !this.nodes.has(edgeConfig.to)) {
      throw new Error('Cannot add edge: one or both nodes do not exist.');
    }
    this.edges.push(edgeConfig);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges<T extends GraphEdgePatternType>(): GraphEdgeType<T>[] {
    return [...this.edges] as GraphEdgeType<T>[];
  }

  getNodeStates(): NodeState[] {
    return Array.from(this.graphState.nodes.values());
  }

  getConnectedNodes(nodeId: string): GraphNode[] {
    return this.edges
      .filter(edge => edge.from === nodeId)
      .map(edge => this.nodes.get(edge.to))
      .filter((node): node is GraphNode => node !== undefined);
  }

  /* ------------------------- Execution ------------------------- */

  async execute(startNodeId: string, message: string): Promise<MessageResponse[]> {
    // Initialize current execution
    this.graphState.currentExecution = {
      startTime: Date.now(),
      nodeStates: new Map(),
      executionPath: [],
    };
    // Clear any previous states
    this.executionState = {
      pending: new Set(),
      completed: new Set(),
      results: new Map(),
    };

    this.contextManager.setContext('query', message);
    this.contextManager.addMessage({ role: 'user', content: message });

    // Start the actual node execution
    const responses: MessageResponse[] = [];
    await this.executeNode(startNodeId, message, [], responses);

    // Finalize and record execution
    const { startTime, executionPath, nodeStates } = this.graphState.currentExecution;
    const endTime = Date.now();
    this.graphState.executionHistory.push({
      startTime,
      endTime,
      duration: endTime - startTime,
      nodeStates: new Map(nodeStates),
      executionPath: [...executionPath],
      input: message,
      finalOutput: responses[responses.length - 1]?.response,
    });

    return responses;
  }

  /**
   * Returns `true` if all parent nodes that point into `nodeKey` have completed.
   * If you want to run a node as soon as ANY parent finishes, tweak this logic.
   */
  private allParentsComplete(nodeKey: string): boolean {
    // Find all edges leading INTO this node
    const incomingEdges = this.edges.filter(e => e.to === nodeKey);
    // If no parents, then it can run by default
    if (incomingEdges.length === 0) return true;

    return incomingEdges.every(e => this.executionState.completed.has(e.from));
  }

  public async executeNode(
    nodeKey: string,
    message: string,
    history: LLMMessageType[],
    responses: MessageResponse[]
  ): Promise<void> {
    // Already done? no-op
    if (this.executionState.completed.has(nodeKey)) {
      return;
    }

    // If not all parents are done yet, skip for now (may be triggered again after parent finishes)
    if (!this.allParentsComplete(nodeKey)) {
      return;
    }

    if (this.executionState.pending.has(nodeKey)) {
      throw new Error(`Circular dependency detected at node: ${nodeKey}`);
    }

    const node = this.nodes.get(nodeKey);
    if (!node) return; // or throw an error

    this.graphState.currentExecution.executionPath.push(nodeKey);
    this.executionState.pending.add(nodeKey);

    const nodeId = uuidv4();
    try {
      // (Optional) If your node has "reasoning" steps, you can do them here
      // let reasoningResult = '';
      // if (node.enableReasoning) {
      //   reasoningResult = await this.processReasoningStep(node, message);
      //   this.events.emit('event', {
      //     nodeId,
      //     nodeKey: node.name,
      //     nodeStatus: 'reasoning',
      //     status: 'pending',
      //     nodeReasoning: reasoningResult,
      //     content: reasoningResult
      //   });
      // }

      // Main message processing
      const fullInput = message;
      const response = await this.processAgentMessage({
        nodeId,
        nodeKey: node.name,
        node,
        message: fullInput,
        type: 'text',
        history,
      });

      responses.push({ nodeId, response });
      this.executionState.results.set(nodeKey, response);

      // Mark node complete
      this.executionState.completed.add(nodeKey);
      this.executionState.pending.delete(nodeKey);

      // Process outgoing edges (the ones from this node)
      const outgoingEdges = this.edges.filter(e => e.from === nodeKey);
      const groupedEdges = this.groupEdgesByPattern(outgoingEdges);
      for (const [pattern, edges] of Array.from(groupedEdges.entries())) {
        await this.processEdgePattern(pattern, edges, response, responses);
      }

      // After finishing this node, see if there are new nodes unblocked
      // by completing this node. We look for edges whose `from` is completed
      // but whose `to` is neither completed nor pending. Then we check if
      // all parents of that `to` are also done:
      const possiblyUnblocked = this.edges
        .map(e => e.to)
        .filter(
          toNodeId =>
            !this.executionState.completed.has(toNodeId) &&
            !this.executionState.pending.has(toNodeId)
        );

      for (const toNodeId of possiblyUnblocked) {
        if (this.allParentsComplete(toNodeId)) {
          // The parent's final response for the new node might come from different parents,
          // so choose whichever logic you want here. We'll re-use the last known response,
          // or you might aggregate or pass the original message:
          const nextInput = this.executionState.results.get(nodeKey) || response;
          await this.executeNode(toNodeId, nextInput, [], responses);
        }
      }
    } catch (error) {
      this.executionState.pending.delete(nodeKey);
      throw error;
    }
  }

  /* ------------------------- Agent & LLM Helpers ------------------------- */

  public async processAgentMessage({
    nodeId,
    nodeKey,
    node,
    message,
    type,
    history,
  }: {
    nodeId: string;
    nodeKey: string;
    node: GraphNode;
    message: string;
    type: 'text' | 'object';
    history?: LLMMessageType[];
  }): Promise<string> {
    const startTime = Date.now();
    this.saveNodeState(nodeId, {
      ...node.getState(),
      key: node.name,
      status: 'pending',
      input: message,
      startTime,
      output: '',
      toolCalls: [],
      toolCallResults: [],
      toolCallErrors: [],
      history: history,
      sources: [],
      metadata: {},
      isStep: node.isStep,
      skipRendering: node.skipRendering,
    });

    try {
      this.events.emit('event', {
        nodeId,
        nodeKey,
        nodeStatus: 'pending',
        status: 'pending',
        nodeInput: `\n\n${message}\n\n${JSON.stringify(history)}`,
        isStep: node.isStep,
        skipRendering: node.skipRendering,
      });

      // Prepare messages for LLM
      const systemPrompt = `Today is ${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })}.\n\n${node.systemPrompt}\n\n`;

      const model = getLanguageModel(node.model);
      const tools = (node.tools || []).reduce(
        (acc, tool) => ({ ...acc, [tool]: aiSdkTools[tool] }),
        {} as Record<string, Tool>
      );

      let citations: string[] = [];
      let fullResponse = '';
      let tokenUsage = 0;

      const completeMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...(history ?? []),
        { role: 'user' as const, content: message },
      ];

      const toolCallsMap = new Map<string, ToolCallType>();
      const toolResultsMap = new Map<string, ToolCallResultType>();
      const errors: unknown[] = [];

      if (type === 'text') {
        const { fullStream, usage } = streamText({
          model,
          messages: completeMessages,
          tools,
          toolCallStreaming: true,
          maxSteps: node.toolSteps,
          maxTokens: node.maxTokens,
        });

        // Wrap streaming in a timeout
        const streamEndPromise = (async () => {
          for await (const chunk of fullStream) {
            switch (chunk.type) {
              case 'text-delta':
                fullResponse += chunk.textDelta;
                citations = this.extractCitations(fullResponse);
                break;
              case 'tool-call':
                toolCallsMap.set(chunk.toolCallId, chunk);
                break;
              case 'tool-result' as any:
                const toolResult = chunk as any;
                toolResultsMap.set(toolResult.toolCallId, toolResult);
                break;
              case 'error':
                errors.push(chunk);
                break;
            }

            // Continuously update node state
            this.saveNodeState(nodeId, {
              ...node.getState(),
              key: node.name,
              output: fullResponse,
              history: completeMessages,
              toolCalls: Array.from(toolCallsMap.values()),
              toolCallResults: Array.from(toolResultsMap.values()),
              status: errors?.length > 0 ? 'error' : 'pending',
              sources: citations,
              error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
              isStep: node.isStep,
              skipRendering: node.skipRendering,
            });

            this.events.emit('event', {
              nodeId,
              nodeKey: node.name,
              status: 'pending',
              content: fullResponse,
              nodeModel: model.modelId,
              history: completeMessages,
              nodeReasoning: node.outputAsReasoning ? fullResponse : undefined,
              toolCalls: Array.from(toolCallsMap.values()),
              toolCallResults: Array.from(toolResultsMap.values()),
              nodeStatus: errors?.length > 0 ? 'error' : 'pending',
              sources: citations,
              error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
              isStep: node.isStep,
              skipRendering: node.skipRendering,
            });
          }
        })();

        await Promise.race([
          streamEndPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('LLM stream timed out')), this.STREAM_TIMEOUT_MS)
          ),
        ]);

        tokenUsage = (await usage).totalTokens;
      } else {
        // 'object' schema-based call
        const { object } = await generateObject({
          model,
          schema: z.object({ response: z.string() }),
          prompt: message,
        });
        fullResponse = object.response;
      }

      // Final updates & events
      const endTime = Date.now();

      node.completeExecution(fullResponse);
      this.saveNodeState(nodeId, {
        ...node.getState(),
        key: node.name,
        output: fullResponse,
        endTime,
        duration: endTime - startTime,
        tokenUsage,
        status: errors.length > 0 ? 'error' : 'completed',
        history: completeMessages,
        sources: citations,
        isStep: node.isStep,
        skipRendering: node.skipRendering,
        error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
      });

      this.events.emit('event', {
        nodeId,
        nodeKey: node.name,
        status: errors.length > 0 ? 'error' : 'completed',
        content: fullResponse,
        history: completeMessages,
        nodeStatus: 'completed',
        nodeInput: `\n\n${message}\n\n${JSON.stringify(history)}`,
        nodeReasoning: node.outputAsReasoning ? fullResponse : undefined,
        sources: citations,
        isStep: node.isStep,
        skipRendering: node.skipRendering,
        error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
      });

      // Add final assistant message + calls to context
      this.contextManager.addMessage({ role: 'assistant', content: `\n\n${fullResponse}\n\n` });

      return fullResponse;
    } catch (error) {
      const endTime = Date.now();
      node.setError(error instanceof Error ? error.message : String(error));
      this.saveNodeState(nodeId, {
        ...node.getState(),
        status: 'error',
        endTime,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : String(error),
        isStep: node.isStep,
      });
      this.events.emit('event', {
        nodeId,
        nodeKey,
        nodeStatus: 'error',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        isStep: node.isStep,
      });
      throw error;
    }
  }

  public async processReasoningStep(node: GraphNode, message: string): Promise<string> {
    const prompt = `Before executing node "${node.name}" with input: "${message}", please think about next steps and provide a reasoning plan.`;
    const { object } = await generateObject({
      model: this.defaultProvider,
      schema: z.object({ reasoning: z.string() }),
      prompt,
    });
    return object.reasoning;
  }

  /* ------------------------- Edge Processing Logic ------------------------- */

  private async processEdgePattern<T extends GraphEdgePatternType>(
    pattern: T,
    edges: GraphEdgeType<T>[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string> {
    const handler = this.edgeHandlerStrategies.get(pattern);
    if (!handler) {
      throw new Error(`No handler registered for edge pattern: ${pattern}`);
    }
    return handler.handle(edges, sourceResponse, responses);
  }

  /* ------------------------- Utilities ------------------------- */

  protected saveNodeState(nodeId: string, state: NodeState): void {
    const existing = this.graphState.nodes.get(nodeId) || { ...state, status: 'pending' };
    const merged = { ...existing, ...state };
    this.graphState.nodes.set(nodeId, merged);
    this.graphState.currentExecution.nodeStates.set(nodeId, merged);
  }

  protected groupEdgesByPattern<T extends GraphEdgePatternType>(
    edges: GraphEdgeType<T>[]
  ): Map<T, GraphEdgeType<T>[]> {
    return edges.reduce((map, edge) => {
      const pattern = edge.pattern as T;
      if (!map.has(pattern)) map.set(pattern, []);
      map.get(pattern)!.push(edge);
      return map;
    }, new Map<T, GraphEdgeType<T>[]>());
  }

  public getInputNodes(nodeId: string): string[] {
    return this.edges.filter(e => e.to === nodeId).map(e => e.from);
  }

  public async withFallback<T extends GraphEdgePatternType>(
    edge: GraphEdgeType<T>,
    task: () => Promise<void>
  ): Promise<void> {
    try {
      await task();
    } catch (error) {
      const config = edge.config as any;
      if (config?.fallbackNode) {
        const fallbackInput = this.executionState.results.get(edge.from) || '';
        await this.executeNode(config.fallbackNode, fallbackInput, [], []);
      } else {
        throw error;
      }
    }
  }

  public async shouldStop(
    stopCondition: string | ((args: ConditionConfigArg) => boolean | Promise<boolean>) | undefined,
    currentResponse: string
  ): Promise<boolean> {
    if (!stopCondition) return false;
    if (typeof stopCondition === 'string') {
      const { object } = await generateObject({
        model: this.defaultProvider,
        schema: z.object({ stop: z.boolean() }),
        prompt: stopCondition,
      });
      return !!object.stop;
    }
    return !!stopCondition({ response: currentResponse, nodes: this.getNodeStates() });
  }

  /* ------------------------- Context and State Getters ------------------------- */

  updateContext(updates: Partial<AgentContextType>): void {
    this.contextManager.updateContext(updates);
  }

  getContext(): AgentContextType {
    return this.contextManager.getContext();
  }

  getNodeStateHistory(nodeId: string): NodeState | undefined {
    return this.graphState.nodes.get(nodeId);
  }

  getCurrentNodeState(nodeId: string): NodeState | undefined {
    return this.graphState.currentExecution.nodeStates.get(nodeId);
  }

  getExecutionHistory(): typeof this.graphState.executionHistory {
    return this.graphState.executionHistory;
  }

  getCurrentExecutionPath(): string[] {
    return this.graphState.currentExecution.executionPath;
  }

  extractCitations(response: string): string[] {
    const citations = response
      .match(/<Source>(.*?)<\/Source>/g)
      ?.map(match => match.replace(/<Source>|<\/Source>/g, ''));
    return Array.from(new Set(citations || []));
  }
}
