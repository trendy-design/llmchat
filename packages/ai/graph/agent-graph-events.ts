import { EventEmitter } from 'node:events';
import type { AgentEventPayload } from './types';

export class AgentGraphEvents extends EventEmitter {
  private cachedPayload: Partial<AgentEventPayload> = {};
  private currentNodeId: string | null = null;

  emit(type: "event", body: AgentEventPayload): boolean {
    if (body.nodeId && body.nodeId !== this.currentNodeId) {
      this.cachedPayload = {};
      this.currentNodeId = body.nodeId;
    }

    Object.keys(body).forEach((key) => {
      const val = body[key as keyof AgentEventPayload];
      if (val !== undefined && val !== null) {
        this.cachedPayload[key as keyof AgentEventPayload] = val as any;
      }
    });

    const mergedPayload: AgentEventPayload = {
      ...this.cachedPayload,
    } as AgentEventPayload;
    return super.emit(type, mergedPayload);
  }

  on(type: "event", callback: (body: AgentEventPayload) => void) {
    return super.on(type, callback);
  }

  off(type: "event", callback: (body: AgentEventPayload) => void) {
    return super.off(type, callback);
  }
}
