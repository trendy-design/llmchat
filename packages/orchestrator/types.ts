import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { EventSchemaDefinition, TypedEventEmitter } from './events';
import { ExecutionContext } from './execution-context';

export type WorkflowConfig = {
    maxIterations?: number;
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    retryDelayMultiplier?: number;
    signal?: AbortSignal;
};

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

// Add a new type for parallel task routing with custom data
export type ParallelTaskRoute<TWorkflow extends WorkflowDefinition = WorkflowDefinition> = {
    task: TaskRouteDestination<TWorkflow>;
    data?: any;
};

export type TaskExecutionFunction<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
    TWorkflow extends WorkflowDefinition<TEvent, TContext> = WorkflowDefinition<TEvent, TContext>,
> = (params: Omit<TaskParams<TEvent, TContext>, 'signal'> & { signal?: AbortSignal }) => Promise<
    | {
          result: any;
          next?:
              | TaskRouteDestination<TWorkflow>
              | Array<TaskRouteDestination<TWorkflow>>
              | ParallelTaskRoute<TWorkflow>[];
      }
    | any
>;

type TaskRouteDestination<TWorkflow extends WorkflowDefinition = WorkflowDefinition> =
    | keyof TWorkflow['tasks']
    | 'end';

type TaskRouterFunction<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
    TWorkflow extends WorkflowDefinition<TEvent, TContext> = WorkflowDefinition<TEvent, TContext>,
> = (
    params: TaskRouterParams<TEvent, TContext>
) => TaskRouteDestination<TWorkflow> | Array<TaskRouteDestination<TWorkflow>> | undefined;

export type WorkflowContextData = {
    [key: string]: any;
};

export type TaskConfig<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = {
    execute: TaskExecutionFunction<TEvent, TContext>;
    route: TaskRouterFunction<TEvent, TContext>;
    dependencies?: string[];
    retryCount?: number;
    timeoutMs?: number;
    onError?: TaskErrorHandler<TEvent, TContext>;
};

export type WorkflowState = {
    completedTasks: Set<string>;
    runningTasks: Set<string>;
    taskData: Map<string, any>;
};

export type TaskOptions = {
    name: string;
    execute: TaskExecutionFunction<any, any>;
    route?: TaskRouterFunction<any, any>;
    dependencies?: string[];
    retryCount?: number;
    timeoutMs?: number;
    onError?: TaskErrorHandler<any, any>;
    signal?: AbortSignal;
};

export type EventPayload = Record<string, any>;

export type TaskTiming = {
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'success' | 'failed';
    error?: Error;
};

export type TaskErrorHandler<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
    TWorkflow extends WorkflowDefinition<TEvent, TContext> = WorkflowDefinition<TEvent, TContext>,
> = (
    error: Error,
    params: TaskParams<TEvent, TContext>
) => Promise<{
    retry?: boolean;
    result?: any;
    next?:
        | TaskRouteDestination<TWorkflow>
        | Array<TaskRouteDestination<TWorkflow>>
        | ParallelTaskRoute<TWorkflow>[];
}>;

export type TaskDefinition<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
    TWorkflow extends WorkflowDefinition<TEvent, TContext> = WorkflowDefinition<TEvent, TContext>,
> = {
    name: string;
    execute: (params: TaskParams<TEvent, TContext>) => Promise<any>;
    route?: (
        params: TaskRouterParams<TEvent, TContext>
    ) => TaskRouteDestination<TWorkflow> | Array<TaskRouteDestination<TWorkflow>> | undefined;
    dependencies?: string[];
    retryCount?: number;
    timeoutMs?: number;
    onError?: TaskErrorHandler<TEvent, TContext>;
};

export type WorkflowDefinition<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = {
    tasks: Record<string, TaskDefinition<TEvent, TContext>>;
    initialTask: keyof WorkflowDefinition<TEvent, TContext>['tasks'];
    config?: WorkflowConfig;
};
