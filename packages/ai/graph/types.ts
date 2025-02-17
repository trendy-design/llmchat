import { z } from 'zod';
import { ToolEnumType } from '../aiSdkTools';
import { ModelEnum } from '../models';


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

export type AgentEventPayload  = {
  nodeId: string;
  nodeKey: string;
  nodeStatus: "pending" | "completed" | "error";
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
  metadata: z.record(z.any()).optional(),
  toolSteps: z.number().default(1),
  tools: z.array(z.nativeEnum(ToolEnumType)),
  isStep: z.boolean().default(false),
  returnOutput: z.boolean().default(true),
});

export type GraphNodeType = z.infer<typeof GraphNodeSchema>;

export const RevisionConfigSchema = z.object({
  maxIterations: z.number().optional(),
  stopCondition: z.union([z.function().args(z.string()).returns(z.promise(z.boolean())), z.string()]).optional(),
  revisionPrompt: z.function().args(z.string()).returns(z.string()).optional(),
});

export const GraphEdgePatternSchema = z.enum(['parallel', 'map', 'reduce', 'condition', 'sequential', 'revision']);
export type GraphEdgePatternType = z.infer<typeof GraphEdgePatternSchema>;
export const GraphConfigSchema = z.object({
  inputTransform: z.function().args(z.string()).returns(z.union([z.promise(z.array(z.string())), z.array(z.string())])).optional(),
  outputTransform: z.function().args(z.array(z.string())).returns(z.union([z.promise(z.string()), z.string()])).optional(),
  condition: z.function().args(z.string()).returns(z.boolean()).optional(),
  priority: z.number().optional(),
  fallbackNode: z.string().optional(),
  revision: RevisionConfigSchema.optional(),
});

const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relationship: z.string(),
  pattern: GraphEdgePatternSchema,
  config: GraphConfigSchema.optional(),
});

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

export type GraphEdgeType = z.infer<typeof GraphEdgeSchema>;

export type FunctionSchemaType = z.infer<typeof FunctionSchema>;
export type CompletionRequestType = z.infer<typeof completionRequestSchema>;

export type LLMMessageType = z.infer<typeof messageSchema>;
