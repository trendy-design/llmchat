import superjson from 'superjson';
import { WorkflowStatus } from './types';

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
    lastUpdated: string;
    status: WorkflowStatus;
};

export class PersistenceLayer<TEvent, TContext> {
    private storage: PersistentStorageAdapter<TEvent, TContext>;

    constructor(storage: PersistentStorageAdapter<TEvent, TContext>) {
        this.storage = storage;
    }

    async saveWorkflow(id: string, engine: any, status: WorkflowStatus): Promise<void> {
        const executionContext = engine.executionContext;
        const events = engine.getEvents();
        const context = engine.getContext();

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
            lastUpdated: new Date().toISOString(),
            status,
        };
        console.log('saveWorkflow', data);
        await this.storage.save(this.getStorageKey(id), data);
    }

    async loadWorkflow(id: string): Promise<WorkflowPersistenceData<TEvent, TContext> | null> {
        const exists = await this.storage.exists(this.getStorageKey(id));
        if (!exists) return null;
        const data = await this.storage.load(this.getStorageKey(id));
        console.log('loadWorkflow', data);
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

    private sanitizeForSerialization(obj: any): any {
        try {
            // Use SuperJSON to safely serialize the object
            const serialized = superjson.stringify(obj);
            // Parse back to an object to ensure it's safe
            return superjson.parse(serialized);
        } catch (error) {
            console.warn('Failed to serialize with SuperJSON:', error);
            // Fallback to simple type handling
            return this.serializeSimpleTypesOnly(obj);
        }
    }

    // Fallback serializer that only handles simple types
    private serializeSimpleTypesOnly(obj: any): any {
        // Handle null or undefined
        if (obj === null || obj === undefined) {
            return obj;
        }

        // Handle primitive types that serialize cleanly
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }

        // Handle arrays by recursively processing their elements
        if (Array.isArray(obj)) {
            return obj.map(item => this.serializeSimpleTypesOnly(item));
        }

        // Handle plain objects
        if (typeof obj === 'object') {
            // Skip any object that's not a plain object (has custom constructor)
            if (obj.constructor !== Object) {
                return null;
            }

            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                // Skip functions and non-basic types
                const processed = this.serializeSimpleTypesOnly(value);
                if (processed !== undefined) {
                    result[key] = processed;
                }
            }
            return result;
        }

        // Skip all other types
        return undefined;
    }
}
