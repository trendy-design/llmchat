import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { ExecutionContext, ParallelTaskRoute, WorkflowConfig } from './engine';
import { EventSchemaDefinition, TypedEventEmitter } from './events';

export type TaskParams<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = {
    data?: any;
    executionContext: ExecutionContext;
    abort: (graceful: boolean) => void;
    trace?: LangfuseTraceClient;
    events?: TypedEventEmitter<TEvent>;
    context?: Context<TContext>;
    config?: WorkflowConfig;
    redirectTo: (nextTask: string | string[] | ParallelTaskRoute[]) => void;
    signal?: AbortSignal;
};

export type TaskRouterParams<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = TaskParams<TEvent, TContext> & {
    result: any;
};

export type TaskErrorHandler<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = (
    error: Error,
    params: TaskParams<TEvent, TContext>
) => Promise<{
    retry?: boolean;
    result?: any;
    next?: string | string[] | ParallelTaskRoute[];
}>;

export type TaskDefinition<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = {
    name: string;
    execute: (params: TaskParams<TEvent, TContext>) => Promise<any>;
    route?: (params: TaskRouterParams<TEvent, TContext>) => string | string[] | undefined;
    dependencies?: string[];
    retryCount?: number;
    timeoutMs?: number;
    onError?: TaskErrorHandler<TEvent, TContext>;
};

export const createTask = <
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
>(
    taskDef: TaskDefinition<TEvent, TContext>
): TaskDefinition<TEvent, TContext> => {
    return taskDef;
};
