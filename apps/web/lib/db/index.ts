import {
  TApiKeys,
  TChatMessage,
  TChatSession,
  TCustomAssistant,
  TPreferences,
  TPrompt,
} from '@repo/shared/types';
import Dexie, { Table } from 'dexie';

export class AppDatabase extends Dexie {
  preferences!: Table<TPreferences>;
  apiKeys!: Table<TApiKeys>;
  chatSessions!: Table<TChatSession>;
  chatMessages!: Table<TChatMessage>;
  customAssistants!: Table<TCustomAssistant>;
  prompts!: Table<TPrompt>;

  constructor() {
    super('AppDatabase');

    this.version(1).stores({
      preferences: '++id',
      apiKeys: 'provider',
      chatSessions: 'id, createdAt, updatedAt',
      chatMessages: 'id, parentId, sessionId, createdAt',
      customAssistants: 'key',
      prompts: 'id',
    });
  }
}

export const db = new AppDatabase();
