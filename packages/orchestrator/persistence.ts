import { WorkflowConfig } from './engine';

type PersistentStorageAdapter<TEvent, TContext> = {
    save(id: string, data: WorkflowPersistenceData<TEvent, TContext>): Promise<void>;
    load(id: string): Promise<WorkflowPersistenceData<TEvent, TContext> | null>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
};

type WorkflowPersistenceData<TEvent, TContext> = {
    id: string;
    workflowState: any;
    eventState: any;
    contextState: any;
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

    async loadWorkflow(id: string, builderFactory: () => any): Promise<any> {
        const exists = await this.storage.exists(this.getStorageKey(id));
        if (!exists) return null;
        const data = await this.storage.load(this.getStorageKey(id));
        if (!data) return null;
        const builder = builderFactory();
        const engine = builder.build();
        this.restoreEngineState(engine, data);
        return engine;
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

    private restoreEngineState(engine: any, data: any) {
        engine.executionContext.state = data.workflowState;
        engine.executionContext.taskExecutionCounts = new Map(Object.entries(data.executionCounts));
        if (data.taskTimings) {
            engine.executionContext.taskTimings = new Map(Object.entries(data.taskTimings));
        }
        const context = engine.getContext();
        if (context && data.contextState) {
            context.merge(data.contextState);
        }
        const events = engine.getEvents();
        if (events && data.eventState) {
            Object.entries(data.eventState).forEach(([key, value]) => {
                events.emit(key, value);
            });
        }
    }

    // Add a new helper method to sanitize objects before serialization
    private sanitizeForSerialization(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
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
