import { EventEmitter } from 'node:events';
import type { AgentEventPayload } from './types';

export class AgentGraphEvents extends EventEmitter {

  emit(type: "event", body: AgentEventPayload): boolean {
    return super.emit(type, body);
  }

  on(type: "event", callback: (body: AgentEventPayload) => void) {
    return super.on(type, callback);
  }

  off(type: "event", callback: (body: AgentEventPayload) => void) {
    return super.off(type, callback);
  }

}
