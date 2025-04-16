import { WorkflowConfig } from './types';

type PersistentStorageAdapter<TEvent, TContext> = {
    save(id: string, data: WorkflowPersistenceData<TEvent, TContext>): Promise<void>;
    load(id: string): Promise<WorkflowPersistenceData<TEvent, TContext> | null>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
};

type WorkflowPersistenceData<TEvent, TContext> = {
    id: string;
    workflowState: any;
    eventState: TEvent;
    contextState: TContext;
    taskTimings: Record<string, any[]>;
    executionCounts: Record<string, number>;
    workflowConfig: WorkflowConfig;
    lastUpdated: string;
};

export class PersistenceLayer<TEvent, TContext> {
    private storage: PersistentStorageAdapter<TEvent, TContext>;

    constructor(storage: PersistentStorageAdapter<TEvent, TContext>) {
        this.storage = storage;
    }

    async saveWorkflow(id: string, engine: any): Promise<void> {
        const executionContext = engine.executionContext;
        const events = engine.getEvents();
        const context = engine.getContext();
        const config = engine.getConfig() || {};

        // Create a sanitized version of the workflow config
        // that doesn't include functions
        const sanitizedConfig = this.sanitizeForSerialization(config);

        const data: WorkflowPersistenceData<TEvent, TContext> = {
            id,
            workflowState: this.sanitizeForSerialization(executionContext.state),
            eventState: events?.getAllState()
                ? this.sanitizeForSerialization(events.getAllState())
                : {},
            contextState: context?.getAll() ? this.sanitizeForSerialization(context.getAll()) : {},
            taskTimings: executionContext.taskTimings
                ? this.sanitizeForSerialization(Object.fromEntries(executionContext.taskTimings))
                : {},
            executionCounts: executionContext.getAllTaskRunCounts(),
            workflowConfig: sanitizedConfig,
            lastUpdated: new Date().toISOString(),
        };
        await this.storage.save(this.getStorageKey(id), data);
    }

    async loadWorkflow(id: string): Promise<WorkflowPersistenceData<TEvent, TContext> | null> {
        const exists = await this.storage.exists(this.getStorageKey(id));
        if (!exists) return null;
        const data = await this.storage.load(this.getStorageKey(id));
        if (!data) return null;
        return data;
    }

    async deleteWorkflow(id: string): Promise<void> {
        await this.storage.delete(this.getStorageKey(id));
    }

    async exists(id: string): Promise<boolean> {
        return this.storage.exists(this.getStorageKey(id));
    }

    private getStorageKey(id: string): string {
        return `workflow:${id}`;
    }

    // Add a new helper method to sanitize objects before serialization
    private sanitizeForSerialization(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (obj instanceof Set) {
            return { type: 'Set', value: Array.from(obj) };
        }

        if (obj instanceof Map) {
            return { type: 'Map', value: Object.fromEntries(obj) };
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeForSerialization(item));
        }

        if (typeof obj === 'object') {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                // Skip functions
                if (typeof value !== 'function') {
                    result[key] = this.sanitizeForSerialization(value);
                }
            }
            return result;
        }

        // Return primitive values as is
        return obj;
    }
}
