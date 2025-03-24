import { EventEmitter } from 'events';
import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { WorkflowConfig } from './deep'; // Import the config type
import { EventSchemaDefinition, TypedEventEmitter } from './events';

type TaskParams<
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

type TaskRouterParams<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = TaskParams<TEvent, TContext> & {
    result: any;
};

// Add a new type for parallel task routing with custom data
export type ParallelTaskRoute = {
    task: string;
    data?: any;
};

type TaskExecutionFunction<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = (
    params: Omit<TaskParams<TEvent, TContext>, 'signal'> & { signal?: AbortSignal }
) => Promise<{ result: any; next?: string | string[] | ParallelTaskRoute[] } | any>;

type TaskRouterFunction<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> = (
    params: TaskRouterParams<TEvent, TContext>
) => string | string[] | ParallelTaskRoute[] | undefined;

export type WorkflowContextData = {
    [key: string]: any;
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

export class ExecutionContext {
    private state: WorkflowState;
    private aborted: boolean;
    private gracefulShutdown: boolean;
    private taskExecutionCounts: Map<string, number>;
    private eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.state = {
            completedTasks: new Set(),
            runningTasks: new Set(),
            taskData: new Map(),
        };
        this.aborted = false;
        this.gracefulShutdown = false;
        this.taskExecutionCounts = new Map();
        this.eventEmitter = eventEmitter;
    }

    setState(func: (state: WorkflowState) => WorkflowState) {
        this.state = func(this.state);
    }

    markTaskComplete(taskName: string, data: any) {
        if (this.aborted && !this.gracefulShutdown) return;

        // Track execution count for this task
        const currentCount = this.taskExecutionCounts.get(taskName) || 0;
        const newCount = currentCount + 1;
        this.taskExecutionCounts.set(taskName, newCount);

        // Emit an event with the updated execution count
        this.emitTaskExecutionEvent(taskName, newCount);

        this.state.completedTasks.add(taskName);
        this.state.runningTasks.delete(taskName);
        this.state.taskData.set(taskName, data);
    }

    resetTaskCompletion(taskName: string) {
        this.state.completedTasks.delete(taskName);
    }

    getTaskExecutionCount(taskName: string): number {
        return this.taskExecutionCounts.get(taskName) || 0;
    }

    isTaskComplete(taskName: string) {
        return this.state.completedTasks.has(taskName);
    }

    isTaskRunning(taskName: string) {
        return this.state.runningTasks.has(taskName);
    }

    getTaskData(taskName: string) {
        return this.state.taskData.get(taskName);
    }

    abortWorkflow(graceful: boolean = false) {
        console.log(
            graceful ? '🟡 Gracefully stopping workflow...' : '🚨 Workflow aborted immediately!'
        );
        this.aborted = true;
        this.gracefulShutdown = graceful;
    }

    isAborted() {
        return this.aborted;
    }

    isGracefulShutdown() {
        return this.gracefulShutdown;
    }

    getAllTaskRunCounts(): Record<string, number> {
        const counts: Record<string, number> = {};
        this.taskExecutionCounts.forEach((count, name) => {
            counts[name] = count;
        });
        return counts;
    }

    emitTaskExecutionEvent(taskName: string, count: number): void {
        if (this.eventEmitter) {
            this.eventEmitter.emit('taskExecution', { taskName, count });
        }
    }

    hasReachedMaxRuns(taskName: string, maxRuns: number): boolean {
        const count = this.getTaskExecutionCount(taskName);
        return count >= maxRuns;
    }
}

export class WorkflowEngine<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> {
    private tasks: Map<string, TaskConfig<TEvent, TContext>>;
    private eventEmitter: EventEmitter;
    private executionContext: ExecutionContext;
    private trace?: LangfuseTraceClient;
    private events?: TypedEventEmitter<TEvent>;
    private context?: Context<TContext>;
    private config?: WorkflowConfig;
    private signal?: AbortSignal;

    constructor({
        trace,
        initialEventState,
        events,
        context,
        config,
        signal,
    }: {
        trace?: LangfuseTraceClient;
        initialEventState?: EventPayload;
        events?: TypedEventEmitter<TEvent>;
        context?: Context<TContext>;
        config?: WorkflowConfig;
        signal?: AbortSignal;
    }) {
        this.tasks = new Map();
        this.eventEmitter = new EventEmitter();
        this.executionContext = new ExecutionContext(this.eventEmitter);
        this.trace = trace;
        this.events = events;
        this.context = context;
        this.config = config;
        this.signal = signal;
    }

    on<T extends string>(event: T, callback: (data: any) => void) {
        this.events?.on(event, callback);
    }

    addTask(name: string, config: TaskConfig<TEvent, TContext>) {
        this.tasks.set(name, config);
    }

    async start(initialTask: string, initialData?: any) {
        // Initialize context with initial data if provided
        if (initialData) {
            // Also update typed context if available
            if (this.context) {
                this.context.merge(initialData);
            }
        }
        await this.executeTask(initialTask, initialData);
    }

    async executeTaskWithTimeout(
        task: (params: TaskParams<TEvent, TContext>) => Promise<any>,
        data: any,
        timeoutMs: number
    ) {
        return Promise.race([
            task({
                data,
                executionContext: this.executionContext,
                abort: this.executionContext.abortWorkflow.bind(this.executionContext),
                trace: this.trace,
                events: this.events,
                context: this.context,
                config: this.config,
                signal: this.signal,
                redirectTo: () => {}, // This will be overridden by the actual function
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('⏳ Task timeout exceeded')), timeoutMs)
            ),
        ]);
    }

    async executeTask(taskName: string, data?: any) {
        if (this.executionContext.isAborted() && !this.executionContext.isGracefulShutdown()) {
            console.log(`⚠️ Task "${taskName}" skipped due to workflow abortion.`);
            return;
        }

        const config = this.tasks.get(taskName);
        if (!config) {
            console.error(`❌ Task "${taskName}" not found.`);
            return;
        }

        if (
            config.dependencies &&
            !config.dependencies.every(dep => this.executionContext.isTaskComplete(dep))
        ) {
            console.log(
                `⏳ Task "${taskName}" is waiting for dependencies: ${config.dependencies.join(', ')}`
            );
            return;
        }

        // For looping tasks, we need to reset the completion status
        if (this.executionContext.isTaskComplete(taskName)) {
            this.executionContext.resetTaskCompletion(taskName);
        }

        if (this.executionContext.isTaskRunning(taskName)) {
            return;
        }

        const executionCount = this.executionContext.getTaskExecutionCount(taskName);
        this.executionContext.setState(state => ({
            ...state,
            runningTasks: state.runningTasks.add(taskName),
        }));
        console.log(`🚀 Executing task "${taskName}" (Run #${executionCount + 1})`);

        let attempt = 0;
        let taskRedirect: string | string[] | ParallelTaskRoute[] | undefined;

        while (attempt <= (config.retryCount || 0)) {
            try {
                // Create a redirect callback function for the task
                const redirectTo = (nextTask: string | string[] | ParallelTaskRoute[]) => {
                    taskRedirect = nextTask;
                };

                const taskResult = config.timeoutMs
                    ? await this.executeTaskWithTimeout(
                          params => config.execute({ ...params, redirectTo }),
                          data,
                          config.timeoutMs
                      )
                    : await config.execute({
                          data,
                          executionContext: this.executionContext,
                          abort: this.executionContext.abortWorkflow.bind(this.executionContext),
                          trace: this.trace,
                          events: this.events,
                          context: this.context,
                          config: this.config,
                          signal: this.signal,
                          redirectTo,
                      });

                // Check if the result is an object with direct routing information
                let result = taskResult;
                let directNextTasks;

                if (
                    taskResult &&
                    typeof taskResult === 'object' &&
                    'result' in taskResult &&
                    'next' in taskResult
                ) {
                    result = taskResult.result;
                    directNextTasks = taskResult.next;
                }

                this.executionContext.markTaskComplete(taskName, result);

                // Emit an event with the updated execution count
                const executionCount = this.executionContext.getTaskExecutionCount(taskName);
                this.executionContext.emitTaskExecutionEvent(taskName, executionCount);

                if (
                    this.executionContext.isAborted() &&
                    !this.executionContext.isGracefulShutdown()
                ) {
                    console.log(`⚠️ Workflow stopped after task "${taskName}".`);
                    return result;
                }

                // Check redirection sources in priority order:
                // 1. Explicit redirect callback from within the task
                // 2. Return value with 'next' property
                // 3. Router function
                let nextTasks = taskRedirect;

                if (nextTasks === undefined && directNextTasks !== undefined) {
                    nextTasks = directNextTasks;
                }

                if (nextTasks === undefined) {
                    nextTasks = config.route({
                        result,
                        executionContext: this.executionContext,
                        abort: this.executionContext.abortWorkflow.bind(this.executionContext),
                        trace: this.trace,
                        events: this.events,
                        context: this.context,
                        config: this.config,
                        redirectTo,
                    });
                }

                // Check for special "end" route value
                if (nextTasks === 'end') {
                    console.log(`🏁 Workflow ended after task "${taskName}".`);
                    return result;
                }

                if (nextTasks) {
                    if (Array.isArray(nextTasks)) {
                        if (
                            nextTasks.length > 0 &&
                            typeof nextTasks[0] === 'object' &&
                            'task' in nextTasks[0]
                        ) {
                            // Handle ParallelTaskRoute[] format
                            await Promise.all(
                                (nextTasks as ParallelTaskRoute[]).map(route =>
                                    this.executeTask(
                                        route.task,
                                        route.data !== undefined ? route.data : result
                                    )
                                )
                            );
                        } else {
                            // Handle string[] format (all tasks get the same data)
                            await Promise.all(
                                (nextTasks as string[]).map(nextTask =>
                                    this.executeTask(nextTask, result)
                                )
                            );
                        }
                    } else {
                        await this.executeTask(nextTasks as string, result);
                    }
                }
                return result;
            } catch (error) {
                attempt++;
                console.error(`❌ Error in task "${taskName}" (Attempt ${attempt}):`, error);

                if (config.onError) {
                    try {
                        const errorResult = await config.onError(error as Error, {
                            data,
                            executionContext: this.executionContext,
                            abort: this.executionContext.abortWorkflow.bind(this.executionContext),
                            trace: this.trace,
                            events: this.events,
                            context: this.context,
                            config: this.config,
                            redirectTo: () => {},
                            signal: this.signal,
                        });

                        if (errorResult.retry) {
                            if (attempt <= (config.retryCount || 0)) {
                                continue;
                            }
                        }

                        if (errorResult.result !== undefined) {
                            this.executionContext.markTaskComplete(taskName, errorResult.result);

                            if (errorResult.next) {
                                if (Array.isArray(errorResult.next)) {
                                    if (typeof errorResult.next[0] === 'object') {
                                        await Promise.all(
                                            (errorResult.next as ParallelTaskRoute[]).map(route =>
                                                this.executeTask(
                                                    route.task,
                                                    route.data !== undefined
                                                        ? route.data
                                                        : errorResult.result
                                                )
                                            )
                                        );
                                    } else {
                                        await Promise.all(
                                            (errorResult.next as string[]).map(nextTask =>
                                                this.executeTask(nextTask, errorResult.result)
                                            )
                                        );
                                    }
                                } else {
                                    await this.executeTask(
                                        errorResult.next as string,
                                        errorResult.result
                                    );
                                }
                            }
                            return errorResult.result;
                        }
                    } catch (errorHandlerError) {
                        console.error(
                            `❌ Error handler failed for task "${taskName}":`,
                            errorHandlerError
                        );
                    }
                }

                if (attempt > (config.retryCount || 0)) {
                    console.error(`⛔ Task "${taskName}" failed after ${attempt} attempts.`);
                    throw error;
                }
            }
        }
    }

    /**
     * Get the typed context
     */
    getContext(): Context<TContext> | undefined {
        return this.context;
    }

    /**
     * Get the typed events
     */
    getEvents(): TypedEventEmitter<TEvent> | undefined {
        return this.events;
    }

    task(options: TaskOptions): void {
        this.addTask(options.name, {
            execute: options.execute,
            route: options.route || (() => undefined),
            dependencies: options.dependencies,
            retryCount: options.retryCount || 0,
            timeoutMs: options.timeoutMs,
            onError: options.onError,
        });
    }

    abort(graceful: boolean = false) {
        this.executionContext.abortWorkflow(graceful);
    }

    getTaskRunCount(taskName: string): number {
        return this.executionContext.getTaskExecutionCount(taskName);
    }

    getAllTaskRunCounts(): Record<string, number> {
        return this.executionContext.getAllTaskRunCounts();
    }

    hasTaskReachedMaxRuns(taskName: string, maxRuns: number): boolean {
        return this.executionContext.hasReachedMaxRuns(taskName, maxRuns);
    }

    // Add a method to get the config
    getConfig(): WorkflowConfig | undefined {
        return this.config;
    }
}
