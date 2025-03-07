import { z } from 'zod';
import { ModelEnum } from '../models';
import { ToolEnumType } from '../tools/types';

export type ToolCallType = {
  toolName: string;
  args: Record<string, unknown>;
  toolCallId: string;
};

export type ToolCallResultType = {
  toolCallId: string;
  result: any;
  args: Record<string, unknown>;
  toolName: string;
};

export type ToolCallErrorType = {
  toolCallId: string;
  error: string;
};

export type AgentContextType = {
  query?: string;
  history: LLMMessageType[];
  model: ModelEnum;
  [key: string]: any;
};


export type NodeState = {
  status: 'idle' | 'pending' | 'completed' | 'error';
  model?: string;
  key: string;
  tokenUsage?: number;
  input?: string;
  output?: string;
  outputMode: 'text' | 'object';
  outputSchema: z.ZodSchema | undefined;
  error?: string;
  history?: LLMMessageType[];
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
  toolCallErrors?: ToolCallErrorType[];
  sources?: string[];
  startTime?: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  isStep?: boolean;
  skipRendering?: boolean;
};

export type AgentEventPayload = {
  nodeId: string;
  nodeKey: string;
  nodeStatus: 'pending' | 'completed' | 'error';
  nodeModel?: string;
  tokenUsage?: number;
  nodeInput?: string;
  history?: LLMMessageType[];
  status: 'pending' | 'completed' | 'error';
  nodeError?: string;
  chunkType: "text" | "reasoning" | "object";
  chunk?: string;
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
  toolCallErrors?: ToolCallErrorType[];
  sources?: string[];
  error?: string;
  isStep?: boolean;
  [key: string]: any;
};

export type AgentResponseType = {
  nodeId: string;
  response: string;
  metadata?: Record<string, any>;
};

export type GraphRequestType = {
  message: string;
  startNodeId: string;
  context?: Record<string, any>;
};

export type GraphResponseType = {
  responses: AgentResponseType[];
  graphPath: string[];
};

export const LLMMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

export const FunctionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().optional(),
  model: z.nativeEnum(ModelEnum),
  maxTokens: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  toolSteps: z.number().default(1),
  tools: z.array(z.nativeEnum(ToolEnumType)),
  isStep: z.boolean().default(false),
  returnOutput: z.boolean().default(true),
  outputAsReasoning: z.boolean().default(false),
  skipRendering: z.boolean().default(false),
});

export type GraphNodeType = z.infer<typeof GraphNodeSchema>;



export type EdgeExecutionState = {
  pending: Set<string>;
  completed: Set<string>;
  results: Map<string, string>;
};

export type FunctionSchemaType = z.infer<typeof FunctionSchema>;
export type CompletionRequestType = z.infer<typeof completionRequestSchema>;

export type LLMMessageType = z.infer<typeof LLMMessageSchema>;

export type GraphEdgePatternType = 'sequential' | 'loop' | 'condition';

export type GraphEdgeType<T extends GraphEdgePatternType> = T extends 'sequential'
  ? SequentialEdge
  : T extends 'loop'
    ? LoopEdge
    : T extends 'condition'
      ? ConditionEdge
      : never;

export type SequentialEdge = {
  from: string;
  to: string;
  pattern: 'sequential';
  config: SequentialConfigType;
};

export type LoopEdge = {
  from: string;
  to: string;
  pattern: 'loop';
  config: LoopConfigType;
};

export type ConditionEdge = {
  from: string;
  trueBranch: string;
  falseBranch: string;
  pattern: 'condition';
  config: ConditionConfigType;
};


export type InputTransformArg = {
  query?: string;
  input: string;
  nodes: NodeState[];
  context: AgentContextType;
  updateContext: (context: (prev: AgentContextType) => Partial<AgentContextType>) => void;

};

export type OutputTransformArg = {
  responses: string[];
  nodes: NodeState[];
  context: AgentContextType;
  updateContext: (context: (prev: AgentContextType) => Partial<AgentContextType>) => void;
};

export type ConditionConfigArg = {
  response: string;
  nodes: NodeState[];
};

export type SpecialMessageType = {
  history: LLMMessageType[];
  userMessage: string;
};

export type LoopConfigType = {
  maxIterations: number;
  stopCondition: (condition: ConditionConfigArg) => boolean | Promise<boolean>;
  inputTransform: (input: InputTransformArg) => SpecialMessageType | Promise<SpecialMessageType>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
};

export type SequentialConfigType = {
  inputTransform: (input: InputTransformArg) => SpecialMessageType | Promise<SpecialMessageType>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
  priority: number;
};

export type ConditionConfigType = {
  condition: (condition: ConditionConfigArg) => boolean | Promise<boolean>;
  inputTransform: (input: InputTransformArg) => SpecialMessageType | Promise<SpecialMessageType>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
};


export type GraphConfigType<T extends GraphEdgePatternType> = {
  fallbackNode?: string;
} & T extends 'loop'
  ? LoopConfigType
  : T extends 'sequential'
    ? SequentialConfigType
    : never;
