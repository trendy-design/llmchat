import { EventEmitter } from 'node:events';
import type { AgentContextType, AgentEventPayload } from './types';

export class AgentGraphEvents extends EventEmitter {
  private cachedPayload: Partial<AgentEventPayload> = {};
  private currentNodeId: string | null = null;

  emit(type: 'event' | 'context', body: AgentEventPayload | AgentContextType): boolean {
    if (type === 'event') {
      const eventBody = body as AgentEventPayload;
      if (eventBody.nodeId && eventBody.nodeId !== this.currentNodeId) {
        this.cachedPayload = {};
        this.currentNodeId = eventBody.nodeId;
      }

      Object.keys(eventBody).forEach(key => {
        const val = eventBody[key as keyof AgentEventPayload];
        if (val !== undefined && val !== null) {
          this.cachedPayload[key as keyof AgentEventPayload] = val as any;
        }
      });

      const mergedPayload: AgentEventPayload = {
        ...this.cachedPayload,
      } as AgentEventPayload;
      return super.emit(type, mergedPayload);
    }
    
    return super.emit(type, body);
  }

  on(type: 'event', callback: (body: AgentEventPayload) => void): this;
  on(type: 'context', callback: (body: AgentContextType) => void): this;
  on(type: 'event' | 'context', callback: (body: any) => void): this {
    return super.on(type, callback);
  }

  off(type: 'event', callback: (body: AgentEventPayload) => void): this;
  off(type: 'context', callback: (body: AgentContextType) => void): this;
  off(type: 'event' | 'context', callback: (body: any) => void): this {
    return super.off(type, callback);
  }
}
