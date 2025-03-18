import { ModelEnum } from '../models';
import type {
  AgentContextType,
  GraphNodeType,
  LLMMessageType
} from './types';

export class AgentContextManager {
  private context: AgentContextType;
  private onContextUpdate: (context: AgentContextType) => void;
  constructor({ initialContext, onContextUpdate }: { initialContext?: Partial<AgentContextType>, onContextUpdate?: (context: AgentContextType) => void }) {
    this.context = {
      history: [],
      model: ModelEnum.GPT_4o_Mini,
      ...initialContext,
    };
    this.onContextUpdate = onContextUpdate ?? (() => { });
  }

  setContext<K extends keyof AgentContextType>(key: K, value: AgentContextType[K]) {
    this.context[key] = value;
  }

  getContext(): AgentContextType {
    return { ...this.context };
  }

  updateContext(updates: (prev: AgentContextType) => Partial<AgentContextType>) {
    this.context = {
      ...this.context,
      ...updates(this.context),
    };
    this.onContextUpdate(this.context);
  }

  addMessage(message: LLMMessageType) {
    this.context.history.push(message);
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
      history: [],
      model: ModelEnum.GPT_4o_Mini,
    };
  }
}
