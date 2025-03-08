  import { InvalidToolArgumentsError, LanguageModelV1, Tool, generateObject, streamText } from 'ai';
import { initLogger, traced } from 'braintrust';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import { toolsDirectory } from '../tools/index';
import { ToolEnumType } from '../tools/types';
import type { AgentContextManager } from './agent-context-manager';
import type { AgentGraphEvents } from './agent-graph-events';
import { GraphNode } from './agent-node';
import { EdgeHandlerStrategy, createEdgeHandlerStrategies } from './edge-pattern-handlers';
import { GraphStateManager } from './graph-state-manager';
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
import { isValidUrl, processToolCallResult } from './utils';


initLogger({
  projectName: 'LLMChat',
  apiKey: process.env.BRAINTRUST_API_KEY || '',
});


  type MessageResponse = { nodeId: string; response: string };

  export class AgentGraph {
    private name: string;
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdgeType<GraphEdgePatternType>[] = [];
    public events: AgentGraphEvents;
    protected contextManager: AgentContextManager;
    protected stateManager: GraphStateManager;
    protected defaultProvider: LanguageModelV1;
    public executionState: EdgeExecutionState;
    protected edgeHandlerStrategies: Map<GraphEdgePatternType, EdgeHandlerStrategy<any>>;
    protected abortController: AbortController;
    constructor({name, events, contextManager, stateManager, abortController}: {name: string, events: AgentGraphEvents, contextManager: AgentContextManager, stateManager: GraphStateManager, abortController: AbortController}) {
      this.name = name;
      this.events = events;
      this.contextManager = contextManager;
      this.stateManager = stateManager;
      this.defaultProvider = getLanguageModel(contextManager.getContext().model);
      this.executionState = {
        pending: new Set(),
        completed: new Set(),
        results: new Map(),
      };
      this.edgeHandlerStrategies = createEdgeHandlerStrategies(this);
      this.abortController = abortController;
      this.name = name;
   
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
      model?: ModelEnum;
      maxTokens?: number;
      outputAsReasoning?: boolean;
      skipRendering?: boolean;
      isStep?: boolean;
      outputMode?: 'text' | 'object';
      outputSchema?: z.ZodSchema;
    }): void {
      this.nodes.set(nodeConfig.id, new GraphNode(nodeConfig));
    }

    addEdge<T extends GraphEdgePatternType>(edgeConfig: GraphEdgeType<T>): void {
      if (!this.nodes.has(edgeConfig.from)) {
        throw new Error(`Cannot add edge: source node ${edgeConfig.from} does not exist.`);
      }

      if (edgeConfig.pattern === 'condition') {
        const conditionEdge = edgeConfig as GraphEdgeType<'condition'>;
        if (!this.nodes.has(conditionEdge.trueBranch) || !this.nodes.has(conditionEdge.falseBranch)) {
          throw new Error('Cannot add condition edge: one or both target nodes do not exist.');
        }
      } else if (!this.nodes.has(edgeConfig.to)) {
        throw new Error(`Cannot add edge: target node ${edgeConfig.to} does not exist.`);
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
      return this.stateManager.getAllNodeStates();
    }

    getConnectedNodes(nodeId: string): GraphNode[] {
      return this.edges
        .flatMap(edge => {
          if (edge.from === nodeId) {
            if (edge.pattern === 'condition') {
              const conditionEdge = edge as GraphEdgeType<'condition'>;
              return [
                this.nodes.get(conditionEdge.trueBranch),
                this.nodes.get(conditionEdge.falseBranch)
              ];
            } else {
              return [this.nodes.get(edge.to)];
            }
          }
          return [];
        })
        .filter((node): node is GraphNode => node !== undefined);
    }

    async execute(startNodeId: string, message: string): Promise<MessageResponse[]> {

      return traced(async (span)=>{
      this.stateManager.startExecution(message);
      this.executionState = {
        pending: new Set(),
        completed: new Set(),
        results: new Map(),
      };

      this.contextManager.setContext('query', message);
      this.contextManager.addMessage({ role: 'user', content: message });

      span.log({
        input: message,
        metadata: {
          startNodeId,
        },
        tags: [process.env.NODE_ENV || "development"]
        })

      const responses: MessageResponse[] = [];
      await this.executeNode(startNodeId, message, [], responses);

      span.end();

      this.stateManager.completeExecution(responses[responses.length - 1]?.response);

      return responses;
      },{
        name:this.name,
        type:"task",
        spanAttributes:{
          env:process.env.NODE_ENV || "development"
        }
        
      })
    }


    private allParentsComplete(nodeKey: string): boolean {
      const incomingEdges = this.edges.filter(e => {
        if (e.pattern === 'condition') {
          const conditionEdge = e as GraphEdgeType<'condition'>;
          return conditionEdge.trueBranch === nodeKey || conditionEdge.falseBranch === nodeKey;
        }
        return e.to === nodeKey;
      });

      if (incomingEdges.length === 0) return true;

      return incomingEdges.every(e => this.executionState.completed.has(e.from));
    }

    public async executeNode(
      nodeKey: string,
      message: string,
      history: LLMMessageType[],
      responses: MessageResponse[]
    ): Promise<void> {
      if (this.abortController.signal.aborted) {
        throw new Error('Execution aborted');
      }

      if (this.executionState.completed.has(nodeKey)) {
        return;
      }
      if (!this.allParentsComplete(nodeKey)) {
        return;
      }

      if (this.executionState.pending.has(nodeKey)) {
        throw new Error(`Circular dependency detected at node: ${nodeKey}`);
      }



      const node = this.nodes.get(nodeKey);
      if (!node) return;

      this.stateManager.addToExecutionPath(nodeKey);
      this.executionState.pending.add(nodeKey);

      const nodeId = uuidv4();
      node?.setId(nodeId);

      const updatedNode = this.nodes.get(nodeKey);
      if (!updatedNode) return;
      


      try {

        const fullInput = message;
        const response = await this.generate({
          nodeId,
          nodeKey: node.name,
          node: updatedNode,
          message: fullInput,
          type: 'text',
          history,
        });

        responses.push({ nodeId, response });
        this.executionState.results.set(nodeKey, response);
        this.executionState.completed.add(nodeKey);
        this.executionState.pending.delete(nodeKey);

        const outgoingEdges = this.edges.filter(e => e.from === nodeKey);
        const groupedEdges = this.groupEdgesByPattern(outgoingEdges);
        for (const [pattern, edges] of Array.from(groupedEdges.entries())) {
          await this.processEdgePattern(pattern, edges, response, responses);
        }

        const possiblyUnblocked = this.edges
          .flatMap(e => {
            if (e.pattern === 'condition') {
              const conditionEdge = e as GraphEdgeType<'condition'>;
              return [conditionEdge.trueBranch, conditionEdge.falseBranch];
            }
            return [e.to];
          })
          .filter(
            toNodeId =>
              !this.executionState.completed.has(toNodeId) &&
              !this.executionState.pending.has(toNodeId)
          );

        for (const toNodeId of possiblyUnblocked) {
          if (this.allParentsComplete(toNodeId)) {
            const nextInput = this.executionState.results.get(nodeKey) || response;
            await this.executeNode(toNodeId, nextInput, [], responses);
          }
        }
      } catch (error) {
        this.executionState.pending.delete(nodeKey);
        throw error;
      }
    }

    getSystemPrompt(node: GraphNode): string {
      return `Today is ${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })}.\n\n${node.systemPrompt}\n\n`;
    }

    getTools(node: GraphNode): Record<string, Tool> {
      return (node.tools || []).reduce(
        (acc, tool) => ({
          ...acc, [tool]: toolsDirectory[tool as ToolEnumType](this)
        }),
        {} as Record<string, Tool>
      );
    }


    public async generate({
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

      if (this.abortController.signal.aborted) {
        throw new Error('Execution aborted');
      }

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
        outputMode: node.outputMode,
        outputSchema: node.outputSchema,
        skipRendering: node.skipRendering,
      });
      console.log('node-started', node.name, 'nodeKey', nodeKey, 'nodeId', nodeId);

      try {

        let finalResponse = '';
        if (node.outputMode === 'text') {
          finalResponse = await this.generateText({ nodeId, nodeKey, node, userMessage: message, history });
        } else {
          finalResponse = await this.generateObject({ nodeId, nodeKey, node, userMessage: message, history });
        }



        node.completeExecution(finalResponse);
        this.contextManager.addMessage({ role: 'assistant', content: `\n\n${finalResponse}\n\n` });
        console.log('node-completed', node.name, 'nodeKey', nodeKey, 'nodeId', nodeId);

        return finalResponse;
      } catch (error) {
        const endTime = Date.now();

        if (InvalidToolArgumentsError.isInstance(error)) {
          console.log('invalid tool arguments error', error);
        }
        console.log('node-error', node.name, 'nodeKey', nodeKey, 'nodeId', nodeId);
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
          chunkType: "text",
        });
        console.log('node-error', node.name, 'nodeKey', nodeKey, 'nodeId', nodeId);
        throw error;
      }
      
    }

    public async generateText({
      nodeId,
      nodeKey,
      node,
      userMessage,
      history,
    }: {
      nodeId: string;
      nodeKey: string;
      node: GraphNode;
      userMessage: string;
      history?: LLMMessageType[];
    }): Promise<string> {
 
      return traced(async (span)=>{
      try {
        if (this.abortController.signal.aborted) {
          throw new Error('Execution aborted');
        }

        const startTime = Date.now();
        this.events.emit('event', {
          nodeId,
          nodeKey,
          nodeStatus: 'pending',
          status: 'pending',
          chunkType: "text",
          isStep: node.isStep
        });

        const systemPrompt = this.getSystemPrompt(node);

        const model = getLanguageModel(node.model);
        const tools = this.getTools(node);

        let citations: string[] = [];
        let fullResponse = '';
        let tokenUsage = 0;

        const completeMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...(history ?? []),
          { role: 'user' as const, content: userMessage },
        ];

        const toolCallsMap = new Map<string, ToolCallType>();
        const toolResultsMap = new Map<string, ToolCallResultType>();
        const errors: unknown[] = [];
        let delta = '';
        console.log('mcp');

        // const mcpTools = await buildAllTools({
        //   mcpServers: {
        //     "tavily-mcp": "https://mcp.composio.dev/serpapi/moldy-bulky-television-BbPYg5"
        //   },
        // });

        // console.log('mcpTools', JSON.stringify(mcpTools, null, 2));


        const { fullStream, usage, toolCalls } = streamText({
          model,
          messages: completeMessages,
          tools,
          toolCallStreaming: true,
          maxSteps: node.toolSteps,
          maxTokens: node.maxTokens,
          abortSignal: this.abortController.signal,
        });

        for await (const chunk of fullStream) {
          switch (chunk.type) {
            case 'text-delta':
              delta = chunk.textDelta;
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

              if (InvalidToolArgumentsError.isInstance(chunk)) {
                console.log('invalid tool arguments error', chunk);
              }


              console.log('error', chunk);
              errors.push(chunk);
              break;
          }


        span.log({
          input: userMessage,
          output: fullResponse,
          metadata: {
            nodeKey,
            nodeId,
            messages: completeMessages,
          }
        }) 
          console.log('fullResponse', toolResultsMap);
          fullResponse = this.sanitizeResponse(fullResponse);

    
          this.saveNodeState(nodeId, {
            ...node.getState(),
            
            key: nodeKey,
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
            nodeKey,
            status: 'pending',
            chunk: delta,
            nodeModel: model.modelId,
            chunkType: node.outputAsReasoning ? "reasoning" : "text",
            toolCalls: Array.from(toolCallsMap.values()),
            toolCallResults: Array.from(toolResultsMap.values()).map(processToolCallResult),
            nodeStatus: errors?.length > 0 ? 'error' : 'pending',
            sources: citations,
            error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
            isStep: node.isStep,
          });

          delta = '';
        }
        const endTime = Date.now();


        this.saveNodeState(nodeId, {
          ...node.getState(),
          key: nodeKey,
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
          nodeKey,
          status: errors.length > 0 ? 'error' : 'completed',
          chunk: "",
          nodeStatus: 'completed',
          chunkType: node.outputAsReasoning ? "reasoning" : "text",
          sources: citations,
          toolCalls: Array.from(toolCallsMap.values()),
          toolCallResults: Array.from(toolResultsMap.values()).map(processToolCallResult),
          isStep: node.isStep,
          error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
        });

        return fullResponse;
      } catch (error) {
        console.log('error', error);
        throw error;
      }
      },{
        name:nodeKey,
        type:"llm"
      })
  
    }

    public async generateObject({
      nodeId,
      nodeKey,
      node,
      userMessage,
      history,
    }: {
      nodeId: string;
      nodeKey: string;
      node: GraphNode;
      userMessage: string;
      history?: LLMMessageType[];
    }): Promise<string> {
      try {
        if (this.abortController.signal.aborted) {
          throw new Error('Execution aborted');
        }

        this.events.emit('event', {
          nodeId,
          nodeKey,
          nodeStatus: 'pending',
          status: 'pending',
          chunkType: "object",
          isStep: node.isStep
        });

        const systemPrompt = this.getSystemPrompt(node);

        const model = getLanguageModel(node.model);

        let citations: string[] = [];
        let fullResponse = '';

        const completeMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...(history ?? []),
          { role: 'user' as const, content: userMessage },
        ];

        const errors: unknown[] = [];

        if (!node.outputSchema) {
          throw new Error('Output schema is required for object mode');
        }


        const { object } = await generateObject({
          model,
          schema: node.outputSchema,
          prompt: userMessage,
          abortSignal: this.abortController.signal,
        });



        fullResponse = JSON.stringify(object);

        this.saveNodeState(nodeId, {
          ...node.getState(),
          key: nodeKey,
          output: fullResponse,
          outputMode: node.outputMode,
          outputSchema: node.outputSchema,
          history: completeMessages,
          status: errors?.length > 0 ? 'error' : 'completed',
          sources: citations,
          error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
          isStep: node.isStep,
          skipRendering: node.skipRendering,
        });

        this.events.emit('event', {
          nodeId,
          nodeKey,
          status: 'completed',
          chunk: JSON.stringify(object),
          nodeModel: model.modelId,
          chunkType: "object",
          nodeStatus: errors?.length > 0 ? 'error' : 'completed',
          sources: citations,
          error: errors?.map(e => JSON.stringify(e)).join('\n\n\n\n') || '',
          isStep: node.isStep,
        });



        return fullResponse;
      } catch (error) {
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

    protected saveNodeState(nodeId: string, state: NodeState): void {
      this.stateManager.saveNodeState(nodeId, state);
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
      return this.edges
        .filter(e => {
          if (e.pattern === 'condition') {
            const conditionEdge = e as GraphEdgeType<'condition'>;
            return conditionEdge.trueBranch === nodeId || conditionEdge.falseBranch === nodeId;
          }
          return e.to === nodeId;
        })
        .map(e => e.from);
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

    updateContext(updates: (prev: AgentContextType) => Partial<AgentContextType>): void {
      this.contextManager.updateContext(updates);
    }

    getContext(): AgentContextType {
      return this.contextManager.getContext();
    }

    getNodeStateHistory(nodeId: string): NodeState | undefined {
      return this.stateManager.getNodeState(nodeId);
    }

    getCurrentNodeState(nodeId: string): NodeState | undefined {
      return this.stateManager.getCurrentNodeState(nodeId);
    }

    getExecutionHistory() {
      return this.stateManager.getExecutionHistory();
    }

    getCurrentExecutionPath(): string[] {
      return this.stateManager.getCurrentExecutionPath();
    }

    sanitizeResponse(response: string): string {
      return response.replace(/<Source>.*?<\/Source>/g, match => {
        const url = match.replace(/<Source>|<\/Source>/g, '').trim();
        return isValidUrl(url) ? match : '';
      });
    }

    extractCitations(response: string): string[] {
      const citations = response
        .match(/<Source>(.*?)<\/Source>/g)
        ?.map(match => match.replace(/<Source>|<\/Source>/g, ''));
      const citationsArray = Array.from(new Set(citations || []));

      const sanitizedCitations = citationsArray.map(citation => citation.trim()).filter(isValidUrl)
      return sanitizedCitations;
    }
  }
