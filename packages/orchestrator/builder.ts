import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { WorkflowConfig, WorkflowEngine } from './engine';
import { EventSchemaDefinition, TypedEventEmitter } from './events';
import { TaskDefinition } from './task';

export type WorkflowBuilderOptions<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = {
    trace?: LangfuseTraceClient;
    initialEventState?: Record<string, any>;
    events?: TypedEventEmitter<TEvent>;
    context?: Context<TContext>;
    config?: WorkflowConfig;
    signal?: AbortSignal;
};

export class WorkflowBuilder<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> {
    private tasks: TaskDefinition<TEvent, TContext>[] = [];
    private options: WorkflowBuilderOptions<TEvent, TContext>;
    private workflowInstance?: WorkflowEngine<TEvent, TContext>;

    constructor(options: WorkflowBuilderOptions<TEvent, TContext> = {}) {
        this.options = options;
    }

    addTask(task: TaskDefinition<TEvent, TContext>): WorkflowBuilder<TEvent, TContext> {
        this.tasks.push(task);
        return this;
    }

    addTasks(tasks: TaskDefinition<TEvent, TContext>[]): WorkflowBuilder<TEvent, TContext> {
        this.tasks.push(...tasks);
        return this;
    }

    build(): WorkflowEngine<TEvent, TContext> {
        this.workflowInstance = new WorkflowEngine<TEvent, TContext>({
            trace: this.options.trace,
            initialEventState: this.options.initialEventState,
            events: this.options.events,
            context: this.options.context,
            config: this.options.config,
            signal: this.options.signal,
        });

        for (const taskDef of this.tasks) {
            this.workflowInstance.task({
                name: taskDef.name,
                execute: taskDef.execute,
                route: taskDef.route,
                dependencies: taskDef.dependencies,
                retryCount: taskDef.retryCount,
                timeoutMs: taskDef.timeoutMs,
                onError: taskDef.onError,
                signal: this.options.signal,
            });
        }

        return this.workflowInstance;
    }

    async start(initialTask: string, initialData?: any) {
        if (!this.workflowInstance) {
            this.workflowInstance = this.build();
        }
        await this.workflowInstance.start(initialTask, initialData);
        return this;
    }

    getTimingSummary() {
        if (!this.workflowInstance) {
            throw new Error('Workflow has not been built yet. Call build() or start() first.');
        }
        return this.workflowInstance.getTimingSummary();
    }
}
