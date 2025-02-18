import { LanguageModelV1, TextStreamPart, Tool, generateObject, streamText } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ToolEnumType, aiSdkTools } from '../aiSdkTools';
import { getLanguageModel } from '../llm/providers';
import type { AgentContextManager } from './agent-context-manager';
import type { AgentGraphEvents } from './agent-graph-events';
import { GraphNode } from './agent-node';
import type { AgentContextType, EdgeExecutionState, GraphEdgePatternType, GraphEdgeType, ToolCallResultType, ToolCallType } from './types';

type MessageResponse = { nodeId: string; response: string };

class AgentGraph {
  private nodes: Map<string, GraphNode>;
  private edges: GraphEdgeType[];
  private events: AgentGraphEvents;
  private contextManager: AgentContextManager;
  private defaultProvider: LanguageModelV1;
  private executionState: EdgeExecutionState;
  private nodeResults: any[] = [];

  constructor(events: AgentGraphEvents, contextManager: AgentContextManager) {
    this.nodes = new Map();
    this.edges = [];
    this.events = events;
    this.contextManager = contextManager;
    this.defaultProvider = getLanguageModel(contextManager.getContext().model);
    this.executionState = {
      pending: new Set(),
      completed: new Set(),
      results: new Map(),
    };
  }

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

  }): void {
    const node = new GraphNode(nodeConfig);
    this.nodes.set(node.id, node);
  }

  addEdge(edgeConfig: GraphEdgeType): void {
    if (!this.nodes.has(edgeConfig.from) || !this.nodes.has(edgeConfig.to)) {
      throw new Error('Cannot add edge: one or both nodes do not exist');
    }
    this.edges.push(edgeConfig);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getConnectedNodes(nodeId: string): GraphNode[] {
    return this.edges
      .filter(edge => edge.from === nodeId)
      .map(edge => this.nodes.get(edge.to))
      .filter((node): node is GraphNode => node !== undefined);
  }

  private async processAgentMessage(
    nodeId: string,
    nodeKey: string,
    node: GraphNode,
    message: string,
    type: "text" | "object"
  ): Promise<string> {
    try {
      this.events.emit('event', {
        nodeId,
        status: 'pending',
        nodeKey: nodeKey,
        nodeStatus: 'pending',
        nodeInput: message,
      });
      const context = this.contextManager.getContext();
      const messages = [
        {
          role: 'system' as const,
          content: `Today is ${new Date().toLocaleDateString()}.\n\n${node.systemPrompt}\n\n`
        },
        { role: 'user' as const, content: message },
      ];
      let fullResponse = '';
      const toolCallsMap = new Map<string, ToolCallType>();
      const toolResultsMap = new Map<string, ToolCallResultType>();
      const model = await this.defaultProvider;
      let tokenUsage: number = 0;
      const tools = (node.tools || []).reduce(
        (acc, tool) => ({ ...acc, [tool]: aiSdkTools[tool] }),
        {} as Record<string, Tool>
      );

      if (type === "text") {
        const { fullStream, usage } = streamText({
          model,
          messages,
          tools,
          toolCallStreaming: true,
          maxSteps: node.toolSteps,
        });
        for await (const chunk of fullStream) {
          switch (chunk.type) {
            case 'text-delta':
              fullResponse += chunk.textDelta;
              break;
            case 'tool-call':
              toolCallsMap.set(chunk.toolCallId, chunk);
              break;
            case 'tool-result' as TextStreamPart<typeof tools>['type']:
              toolResultsMap.set((chunk as any).toolCallId, chunk as any);
              break;
          }
          this.events.emit('event', {
            nodeId,
            nodeKey: node.name,
            status: 'pending',
            content: fullResponse,
            toolCalls: Array.from(toolCallsMap.values()),
            toolCallResults: Array.from(toolResultsMap.values()),
            nodeStatus: 'pending',
            nodeModel: model.modelId,
          });
        }
        tokenUsage = (await usage).totalTokens;
      } else {
        const { object } = await generateObject({
          model,
          schema: z.object({
            response: z.string(),
          }),
          prompt: message,
        });
        fullResponse = object.response;
      }

      const toolCalls = Array.from(toolCallsMap.values());
      const toolCallResults = Array.from(toolResultsMap.values());
      this.nodeResults.push({
        nodeId,
        nodeKey,
        fullResponse,
        toolCalls: toolCalls.length,
        toolCallResults: toolCallResults.length,
        tokenUsage,
      });
      this.events.emit('event', {
        nodeId,
        nodeKey: node.name,
        status: 'completed',
        content: fullResponse,
        toolCalls,
        toolCallResults,
        nodeStatus: 'completed',
        nodeInput: message,
      });
      this.contextManager.addMessage({
        role: 'assistant',
        content: `\n\n${fullResponse}\n\n`,
      });
      this.contextManager.addToolCall(toolCalls);
      this.contextManager.addToolCallResult(toolCallResults);
      return fullResponse;
    } catch (error) {
      this.events.emit('event', {
        nodeId,
        nodeKey: node.name,
        status: 'error',
        error: error instanceof Error ? error.message : JSON.stringify(error),
        nodeStatus: 'error',
      });
      throw error;
    }
  }

  async execute(startNodeId: string, message: string): Promise<MessageResponse[]> {
    const responses: MessageResponse[] = [];
    this.executionState = {
      pending: new Set(),
      completed: new Set(),
      results: new Map(),
    };
    this.contextManager.addMessage({
      role: 'user',
      content: message,
    });
    await this.executeNode(startNodeId, message, responses);
    return responses;
  }

  updateContext(updates: Partial<AgentContextType>): void {
    this.contextManager.updateContext(updates);
  }

  getContext(): AgentContextType {
    return this.contextManager.getContext();
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): GraphEdgeType[] {
    return [...this.edges];
  }

  private async processReasoningStep(
    node: GraphNode,
    message: string
  ): Promise<string> {
    const model = await this.defaultProvider;
    const prompt = `Before executing node "${node.name}" with input: "${message}", please think about next steps and provide a reasoning plan for the next step. for exmaple if user ask for "Agentic design pattern" then you should think and output like this:
    "Okay, so I need to understand what the Agentic Design Pattern is. Let me start by breaking down the term. "Agentic" probably relates to agents, like software agents, which are autonomous entities that act on behalf of a user. Design patterns are common solutions to recurring problems in software design. So, putting that together, Agentic Design Pattern might refer to a design approach where software agents are the primary components, each handling specific tasks autonomously." `;
    const { object } = await generateObject({
      model,
      schema: z.object({ reasoning: z.string() }),
      prompt,
    });
    return object.reasoning;
  }

  private async executeNode(
    nodeKey: string,
    message: string,
    responses: MessageResponse[]
  ): Promise<void> {
    if (this.executionState.completed.has(nodeKey)) return;
    if (this.executionState.pending.has(nodeKey)) {
      throw new Error(`Circular dependency detected at node: ${nodeKey}`);
    }
    const node = this.nodes.get(nodeKey);
    if (!node) return;
    this.executionState.pending.add(nodeKey);
    const nodeId = uuidv4();
    try {
      let reasoningResult = '';
      if (node.enableReasoning) {
        reasoningResult = await this.processReasoningStep(node, message);
        console.log('reasoningResult', reasoningResult);
        this.events.emit('event', {
          nodeId,
          nodeKey: node.name,
          nodeStatus: 'reasoning',
          status: 'pending',
          nodeReasoning: reasoningResult,
          content: reasoningResult,
        });
      }
      const response = await this.processAgentMessage(
        nodeId,
        node.name,
        node,
        !!reasoningResult ? `${reasoningResult}\n\n${message}` : message,
        'text'
      );
      responses.push({ nodeId, response });
      this.executionState.results.set(nodeKey, response);
      const outgoingEdges = this.edges.filter(edge => edge.from === nodeKey);
      const edgeGroups = this.groupEdgesByPattern(outgoingEdges);
      for (const [pattern, edges] of Array.from(edgeGroups.entries())) {
        const result = await this.processEdgePattern(
          pattern,
          edges,
          response,
          responses
        );
        if (pattern === 'revision') {
          this.executionState.results.set(nodeKey, result);
        }
      }
      this.executionState.completed.add(nodeKey);
      this.executionState.pending.delete(nodeKey);
      const remainingEdges = this.edges.filter(
        edge =>
          this.executionState.completed.has(edge.from) &&
          !this.executionState.completed.has(edge.to)
      );
      if (remainingEdges.length > 0) {
        const remainingGroups = this.groupEdgesByPattern(remainingEdges);
        for (const [pattern, edges] of Array.from(remainingGroups.entries())) {
          await this.processEdgePattern(
            pattern,
            edges,
            this.executionState.results.get(nodeKey) || response,
            responses
          );
        }
      }
    } catch (error) {
      this.executionState.pending.delete(nodeKey);
      throw error;
    }
  }

  private async processEdgePattern(
    pattern: GraphEdgePatternType,
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string> {
    let result = sourceResponse;
    switch (pattern) {
      case 'revision':
        result = await this.processRevisionEdges(edges, sourceResponse, responses);
        break;
      case 'parallel':
        await this.processParallelEdges(edges, sourceResponse, responses);
        break;
      case 'map':
        await this.processMapEdges(edges, sourceResponse, responses);
        break;
      case 'reduce':
        await this.processReduceEdges(edges, sourceResponse, responses);
        break;
      case 'condition':
        await this.processConditionEdges(edges, sourceResponse, responses);
        break;
      default:
        await this.processSequentialEdges(edges, sourceResponse, responses);
    }
    return result;
  }

  private async processRevisionEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<string> {
    let finalResponse = sourceResponse;
    for (const edge of edges) {
      await this.processEdgeWithFallback(edge, async () => {
        const config = edge.config?.revision ?? {};
        const maxIterations = config.maxIterations ?? 3;
        const stopCondition = config.stopCondition;

        const revisionPrompt =
          config.revisionPrompt ??
          ((prev: string) =>
            `Please review and improve the following response: ${prev}`);
        let currentResponse = sourceResponse;
        let iterations = 0;

        while (iterations < maxIterations) {
          if (stopCondition) {
            if (typeof stopCondition === 'string') {
              const { object } = await generateObject({
                model: this.defaultProvider,
                schema: z.object({
                  stop: z.boolean(),
                }),
                prompt: stopCondition,
              });
              if (object.stop) break;
            } else if (await stopCondition(currentResponse)) {
              break;
            }
          }

          const nextNode = this.nodes.get(edge.to);
          if (!nextNode) break;
          const nodeId = uuidv4();
          const prompt = revisionPrompt(currentResponse);
          let reasoningResult = '';
          if (nextNode.enableReasoning) {
            const reasoningResult = await this.processReasoningStep(nextNode, currentResponse);
            this.events.emit('event', {
              nodeId,
              nodeKey: nextNode.name,
              status: 'pending',
              nodeStatus: 'reasoning',
              nodeReasoning: reasoningResult,
              content: reasoningResult,
            });
          }
          
          currentResponse = await this.processAgentMessage(
            nodeId,
            nextNode.name,
            nextNode,
            reasoningResult ? `${reasoningResult}\n\n${currentResponse}` : currentResponse,
            'text'
          );
          responses.push({ nodeId, response: currentResponse });
          iterations++;
        }
        finalResponse = currentResponse;
        this.executionState.results.set(edge.to, currentResponse);
        this.executionState.completed.add(edge.to);
      });
    }
    return finalResponse;
  }

  private async processParallelEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<void> {
    await Promise.all(
      edges.map((edge) =>
        this.processEdgeWithFallback(edge, async () => {
          await this.executeNode(edge.to, sourceResponse, responses);
        })
      )
    );
  }

  private async processMapEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<void> {
    for (const edge of edges) {
      await this.processEdgeWithFallback(edge, async () => {
        const inputs = edge.config?.inputTransform
          ? await Promise.resolve(edge.config.inputTransform(sourceResponse))
          : [sourceResponse];
        const mappedResponses: string[] = [];
        await Promise.all(
          inputs.map(async (input) => {
            const nextNode = this.nodes.get(edge.to);
            if (!nextNode) return;
            const nodeId = uuidv4();
            
            if (nextNode.enableReasoning) {
              const reasoningResult = await this.processReasoningStep(nextNode, input);
              this.events.emit('event', {
                nodeId,
                nodeKey: nextNode.name,
                status: 'pending',
                nodeStatus: 'reasoning',
                nodeReasoning: reasoningResult,
                content: reasoningResult,
              });
            }

            const mapped = await this.processAgentMessage(
              nodeId,
              nextNode.name,
              nextNode,
              input,
              'text'
            );
            mappedResponses.push(mapped);
          })
        );
        const finalResponse = edge.config?.outputTransform
          ? await Promise.resolve(edge.config.outputTransform(mappedResponses))
          : mappedResponses.join('\n');
        responses.push({ nodeId: edge.to, response: finalResponse });
        this.executionState.results.set(edge.to, finalResponse);
        this.executionState.completed.add(edge.to);
      });
    }
  }

  private async processReduceEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<void> {
    for (const edge of edges) {
      await this.processEdgeWithFallback(edge, async () => {
        const inputNodes = this.getInputNodes(edge.to);
        const inputResponses = inputNodes.map(
          (nodeId) => this.executionState.results.get(nodeId) ?? ''
        );
        const reduced = edge.config?.outputTransform
          ? await Promise.resolve(edge.config.outputTransform(inputResponses))
          : inputResponses.join('\n');
        await this.executeNode(edge.to, reduced, responses);
      });
    }
  }

  private async processConditionEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<void> {
    for (const edge of edges) {
      if (edge.config?.condition?.(sourceResponse)) {
        await this.processEdgeWithFallback(edge, async () => {
          await this.executeNode(edge.to, sourceResponse, responses);
        });
      }
    }
  }

  private async processSequentialEdges(
    edges: GraphEdgeType[],
    sourceResponse: string,
    responses: MessageResponse[]
  ): Promise<void> {
    const sortedEdges = edges.sort(
      (a, b) => (a.config?.priority ?? 0) - (b.config?.priority ?? 0)
    );
    for (const edge of sortedEdges) {
      await this.processEdgeWithFallback(edge, async () => {
        await this.executeNode(edge.to, sourceResponse, responses);
      });
    }
  }

  private async processEdgeWithFallback(
    edge: GraphEdgeType,
    task: () => Promise<void>
  ): Promise<void> {
    try {
      await task();
    } catch (error) {
      if (edge.config?.fallbackNode) {
        const fallbackFromResponse = this.executionState.results.get(edge.from) || '';
        await this.executeNode(edge.config.fallbackNode, fallbackFromResponse, []);
      } else {
        throw error;
      }
    }
  }

  private getInputNodes(nodeId: string): string[] {
    return this.edges
      .filter((edge) => edge.to === nodeId)
      .map((edge) => edge.from);
  }

  private groupEdgesByPattern(edges: GraphEdgeType[]): Map<GraphEdgePatternType, GraphEdgeType[]> {
    return edges.reduce((groups, edge) => {
      const pattern = edge.pattern;
      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(edge);
      return groups;
    }, new Map<GraphEdgePatternType, GraphEdgeType[]>());
  }
}

export { AgentGraph };
