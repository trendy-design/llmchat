import { ModelEnum } from '../models';
import type { AgentContextType, GraphNodeType, LLMMessageType, ToolCallResultType, ToolCallType } from './types';

export class AgentContextManager {
  private context: AgentContextType;

  constructor(initialContext?: Partial<AgentContextType>) {
    this.context = {
      formattingPrompt:
        'Today is ' + new Date().toLocaleDateString() + '. you are helpful assistant. you are helping user with their questions. ',
      threadId: '',
      threadItemId: '',
      parentThreadItemId: '',
      history: [],
      model: ModelEnum.GPT_4o_Mini,
      toolCalls: [],
      toolCallResults: [],
      ...initialContext,
    };
  }

  setContext<K extends keyof AgentContextType>(key: K, value: AgentContextType[K]) {
    this.context[key] = value;
  }

  getContext(): AgentContextType {
    return { ...this.context };
  }

  updateContext(updates: Partial<AgentContextType>) {
    this.context = {
      ...this.context,
      ...updates,
    };
  }

  addMessage(message: LLMMessageType) {
    this.context.history.push(message);
  }

  addToolCall(toolCalls: ToolCallType[]) {
    this.context.toolCalls = [...(this.context.toolCalls || []), ...toolCalls];
  }

  addToolCallResult(toolCallResults: ToolCallResultType[]) {
    this.context.toolCallResults = [...(this.context.toolCallResults || []), ...toolCallResults];
  }

  mergeNodeContext(node: GraphNodeType) {
    return {
      ...this.context,
      role: node.role,
      systemPrompt: node.systemPrompt,
    };
  }

  clear() {
    this.context = {
      formattingPrompt:
        'Today is ' + new Date().toLocaleDateString() + '. you are helpful assistant. you are helping user with their questions. ',
      threadId: '',
      threadItemId: '',
      parentThreadItemId: '',
      history: [],
      model: ModelEnum.GPT_4o_Mini,
    };
  }
}
