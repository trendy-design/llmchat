import { z } from 'zod';
import { ModelEnum } from '../models';
import { ToolEnumType } from '../tools';


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
  formattingPrompt: string;
  threadId: string;
  threadItemId: string;
  parentThreadItemId: string;
  history: LLMMessageType[];
  model: ModelEnum;
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
};

export type NodeState = {
  status: "idle" | "pending" | "completed" | "error" | "reasoning";
  model?: string;
  key: string;
  tokenUsage?: number;
  input?: string;
  output?: string;
  error?: string;
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
  toolCallErrors?: ToolCallErrorType[];
  sources?: string[];
  startTime?: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export type AgentEventPayload  = {
  nodeId: string;
  nodeKey: string;
  nodeStatus: "pending" | "completed" | "error" | "reasoning";
  nodeReasoning?: string;
  nodeModel?: string;
  tokenUsage?: number;
  nodeInput?: string;
  status: "pending" | "completed" | "error";
  nodeError?: string;
  content?: string;
  fullResponse?: string;
  toolCalls?: ToolCallType[];
  toolCallResults?: ToolCallResultType[];
  toolCallErrors?: ToolCallErrorType[];
  sources?: string[];
  error?: string;
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

const messageSchema = z.object({
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
  enableReasoning: z.boolean().default(false),
  outputAsReasoning: z.boolean().default(false),
});

export type GraphNodeType = z.infer<typeof GraphNodeSchema>;

// export const RevisionConfigSchema = z.object({
//   maxIterations: z.number().optional(),
//   stopCondition: z.union([z.function().args(z.string()).returns(z.promise(z.boolean())), z.string()]).optional(),
//   revisionPrompt: z.function().args(z.string()).returns(z.string()).optional(),
// });

// export const LoopConfigSchema = z.object({
//   maxIterations: z.number().optional(),
//   stopCondition: z.union([z.function().args(z.string()).returns(z.promise(z.boolean())), z.string()]).optional(),
//   inputTransform: z.function().args(z.string()).returns(z.union([z.promise(z.array(z.string())), z.array(z.string())])).optional(),
//   outputTransform: z.function().args(z.array(z.string())).returns(z.union([z.promise(z.string()), z.string()])).optional(),
// });

// export const GraphEdgePatternSchema = z.enum(['parallel', 'map', 'reduce', 'condition', 'sequential', 'revision', 'loop']);
// export type GraphEdgePatternType = z.infer<typeof GraphEdgePatternSchema>;
// export const GraphConfigSchema = z.object({
//   inputTransform: z.function().args(z.string()).returns(z.union([z.promise(z.array(z.string())), z.array(z.string())])).optional(),
//   outputTransform: z.function().args(z.array(z.string())).returns(z.union([z.promise(z.string()), z.string()])).optional(),
//   condition: z.function().args(z.string()).returns(z.boolean()).optional(),
//   priority: z.number().optional(),
//   fallbackNode: z.string().optional(),
//   revision: RevisionConfigSchema.optional(),
//   loop: LoopConfigSchema.optional(),
// });

// const GraphEdgeSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   relationship: z.string(),
//   pattern: GraphEdgePatternSchema,
//   config: GraphConfigSchema.optional(),
// });

export const completionRequestSchema = z.object({
  threadId: z.string(),
  threadItemId: z.string(),
  parentThreadItemId: z.string(),
  prompt: z.string(),
  messages: z.array(messageSchema),
});

export type EdgeExecutionState = {
  pending: Set<string>;
  completed: Set<string>;
  results: Map<string, string>;
};

// export type GraphEdgeType = z.infer<typeof GraphEdgeSchema>;

export type FunctionSchemaType = z.infer<typeof FunctionSchema>;
export type CompletionRequestType = z.infer<typeof completionRequestSchema>;

export type LLMMessageType = z.infer<typeof messageSchema>;

export type GraphEdgePatternType = "parallel" | "map" | "reduce" | "condition" | "sequential" | "revision" | "loop";

export type GraphEdgeType<T extends GraphEdgePatternType> = {
  from: string;
  to: string;
  pattern: T;
  config: GraphConfigType<T>;
}


export type InputTransformArg = {
  input: string;
  nodes: NodeState[];
}

export type OutputTransformArg = {
  responses: string[];
  nodes: NodeState[];
}

export type ConditionConfigArg = {
  response: string;
  nodes: NodeState[];
}

export type MapConfigType = {
  inputTransform: (input: InputTransformArg) => string[] | Promise<string[]>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
}

export type ReduceConfigType = {
  inputTransform: (input: InputTransformArg) => string[] | Promise<string[]>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
}

export type ConditionConfigType = {
  condition: (condition: ConditionConfigArg) => boolean;
  priority: number;
  fallbackNode: string;
}

export type RevisionConfigType = {
  maxIterations: number;
  stopCondition: (condition: ConditionConfigArg) => boolean | Promise<boolean>;
  revisionPrompt: (condition: ConditionConfigArg) => string | Promise<string>;
}

export type LoopConfigType = {
  maxIterations: number;
  stopCondition: (condition: ConditionConfigArg) => boolean | Promise<boolean>;
  inputTransform: (input: InputTransformArg) => string | Promise<string>;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
}

export type SequentialConfigType = {
  inputTransform: (input: InputTransformArg) => string | Promise<string> ;
  outputTransform: (responses: OutputTransformArg) => string | Promise<string>;
  priority: number;
}


export type GraphConfigType<T extends GraphEdgePatternType> = {
  fallbackNode?: string;
} & T extends "map" ? MapConfigType : T extends "reduce" ? ReduceConfigType : T extends "condition" ? ConditionConfigType : T extends "revision" ? RevisionConfigType : T extends "loop" ? LoopConfigType : T extends "sequential" ? SequentialConfigType : never;
