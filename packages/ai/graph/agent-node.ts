import { ToolEnumType } from '../aiSdkTools';
import { ToolCallErrorType, ToolCallResultType, ToolCallType } from './types';

export type GraphNodeState = {
  reasoning?: string;
  response?: string;
  tokenUsage?: number;
  status?: "pending" | "completed" | "error" | "reasoning";
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
  toolCallErrors?: ToolCallErrorType[];
}

export class GraphNode {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'pending' | 'completed' | 'failed';
  systemPrompt: string;
  temperature: number;
  response: string;
  tools: ToolEnumType[];
  toolSteps: number;
  enableReasoning: boolean;
  private metadata: Record<string, any>;
  private state: GraphNodeState = {
    reasoning: undefined,
    response: undefined,
    tokenUsage: undefined,
    status: 'pending',
    toolCalls: [],
    toolCallResults: [],
    toolCallErrors: [],
  };

  constructor({
    id,
    name,
    role,
    systemPrompt,
    status = 'idle',
    temperature = 0.7,
    metadata = {},
    tools = [],
    toolSteps = 1,
    enableReasoning = false,
  }: {
    id: string;
    name: string;
    role: string;
    systemPrompt: string;
    status?: 'idle' | 'pending' | 'completed' | 'failed';
    temperature?: number;
    metadata?: Record<string, any>;
    tools?: ToolEnumType[];
    toolSteps?: number;
    enableReasoning?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.response = '';
    this.status = status;
    this.systemPrompt = systemPrompt;
    this.temperature = temperature;
    this.metadata = metadata;
    this.tools = tools;
    this.toolSteps = toolSteps;
    this.enableReasoning = enableReasoning;
  }

  getState(): GraphNodeState {
    return this.state;
  }

  setState(state: GraphNodeState): void {
    this.state = state;
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
      response: this.response,
      systemPrompt: this.systemPrompt,
      temperature: this.temperature,
      metadata: this.metadata,
    };
  }
}
