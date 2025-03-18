import { z } from 'zod';
import { ModelEnum } from '../models';
import { ToolEnumType } from '../tools/types';
import { NodeState, ToolCallErrorType, ToolCallResultType, ToolCallType } from './types';
export class GraphNode {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  maxTokens?: number;
  model: ModelEnum;
  tools: ToolEnumType[];
  toolSteps: number;
  isStep: boolean;
  skipRendering: boolean;
  private metadata: Record<string, any>;
  outputAsReasoning: boolean;
  outputMode: 'text' | 'object';
  outputSchema?: z.ZodSchema;

  private state: NodeState = {
    key: '',
    status: 'idle',
    toolCalls: [],
    toolCallResults: [],
    toolCallErrors: [],
    startTime: 0,
    metadata: {},
    skipRendering: false,
    outputMode: 'text',
    outputSchema: undefined,
  };

  constructor({
    id,
    name,
    role,
    systemPrompt,
    temperature = 0.7,
    metadata = {},
    tools = [],
    toolSteps = 1,
    model = ModelEnum.GPT_4o_Mini,
    maxTokens = undefined,
    outputAsReasoning = false,
    isStep = false,
    skipRendering = false,
    outputMode = 'text',
    outputSchema = undefined,
  }: {
    id: string;
    name: string;
    role: string;
    systemPrompt: string;
    temperature?: number;
    metadata?: Record<string, any>;
    tools?: ToolEnumType[];
    toolSteps?: number;
    model?: ModelEnum;
    maxTokens?: number;
    outputAsReasoning?: boolean;
    isStep?: boolean;
    skipRendering?: boolean;
    outputMode?: 'text' | 'object';
    outputSchema?: z.ZodSchema;
  }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.temperature = temperature;
    this.metadata = metadata;
    this.tools = tools;
    this.toolSteps = toolSteps;
    this.model = model;
    this.maxTokens = maxTokens;
    this.outputAsReasoning = outputAsReasoning;
    this.isStep = isStep;
    this.skipRendering = skipRendering;
    this.outputMode = outputMode;
    this.outputSchema = outputSchema;
    // Initialize state with the node name
    this.state = {
      ...this.state,
      key: name,
    };
  }

  getState(): NodeState {
    return this.state;
  }

  setState(state: Partial<NodeState>): void {
    this.state = { ...this.state, ...state };
  }

  setId(id: string): void {
    this.id = id;
  }

  startExecution(input: string): void {
    this.state = {
      ...this.state,
      status: 'pending',
      startTime: Date.now(),
      input,
    };
  }

  completeExecution(response: string): void {
    this.state = {
      ...this.state,
      status: 'completed',
      endTime: Date.now(),
      duration: Date.now() - (this.state.startTime || 0),
      output: response,
    };
  }

  setError(error: string): void {
    this.state = {
      ...this.state,
      status: 'error',
      endTime: Date.now(),
      duration: Date.now() - (this.state.startTime || 0),
      error,
    };
  }

  addToolCall(toolCall: ToolCallType): void {
    this.state.toolCalls = [...(this.state.toolCalls || []), toolCall];
  }

  addToolCallResult(result: ToolCallResultType): void {
    this.state.toolCallResults = [...(this.state.toolCallResults || []), result];
  }

  addToolCallError(error: ToolCallErrorType): void {
    this.state.toolCallErrors = [...(this.state.toolCallErrors || []), error];
  }

  // Getters and setters for metadata
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata[key];
  }

  // Method to update node properties
  update(updates: Partial<Omit<GraphNode, 'id'>>): void {
    Object.assign(this, updates);
  }

  // Method to clone the node
  clone(): GraphNode {
    return new GraphNode({
      id: this.id,
      name: this.name,
      role: this.role,
      systemPrompt: this.systemPrompt,
      temperature: this.temperature,
      metadata: { ...this.metadata },
    });
  }

  // Method to serialize the node
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      output: this.state.output,
      systemPrompt: this.systemPrompt,
      temperature: this.temperature,
      metadata: this.metadata,
    };
  }
}
