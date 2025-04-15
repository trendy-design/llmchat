import { WorkflowConfig } from './types';

type PersistentStorageAdapter = {
    save(key: string, data: any): Promise<void>;
    load(key: string): Promise<any | null>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
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
    private storage: PersistentStorageAdapter;

    constructor(storage: PersistentStorageAdapter) {
        this.storage = storage;
    }

    async saveWorkflow(id: string, engine: any): Promise<void> {
        const executionContext = engine.executionContext;
        const events = engine.getEvents();
        const context = engine.getContext();
        const data: WorkflowPersistenceData<TEvent, TContext> = {
            id,
            workflowState: executionContext.state,
            eventState: events?.getAllState() || {},
            contextState: context?.getAll() || {},
            taskTimings: executionContext.taskTimings
                ? Object.fromEntries(executionContext.taskTimings)
                : {},
            executionCounts: executionContext.getAllTaskRunCounts(),
            workflowConfig: engine.getConfig() || {},
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
}
