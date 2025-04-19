import { EventEmitter } from 'events';
import { LangfuseTraceClient } from 'langfuse';
import { v4 as uuidv4 } from 'uuid';
import { Context, ContextSchemaDefinition } from './context';
import { EventSchemaDefinition, TypedEventEmitter } from './events';
import { ExecutionContext } from './execution-context';
import { PersistenceLayer } from './persistence';
import {
    EventPayload,
    ParallelTaskRoute,
    TaskConfig,
    TaskOptions,
    TaskParams,
    WorkflowConfig,
    WorkflowStatus,
} from './types';

export class WorkflowEngine<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> {
    private id: string;
    private tasks: Map<string, TaskConfig<TEvent, TContext>>;
    private eventEmitter: EventEmitter;
    private executionContext: ExecutionContext;
    private trace?: LangfuseTraceClient;
    private events?: TypedEventEmitter<TEvent>;
    private context?: Context<TContext>;
    private config?: WorkflowConfig;
    private persistence?: PersistenceLayer<TEvent, TContext>;
    private signal?: AbortSignal;
    private status: WorkflowStatus = WorkflowStatus.PENDING;

    constructor({
        id,
        trace,
        initialEventState,
        events,
        context,
        config,
        signal,
        persistence,
    }: {
        id: string;
        trace?: LangfuseTraceClient;
        initialEventState?: EventPayload;
        events?: TypedEventEmitter<TEvent>;
        context?: Context<TContext>;
        config?: WorkflowConfig;
        signal?: AbortSignal;
        persistence?: PersistenceLayer<TEvent, TContext>;
    }) {
        this.id = id;
        this.tasks = new Map();
        this.eventEmitter = new EventEmitter();
        this.executionContext = new ExecutionContext(this.eventEmitter);
        this.trace = trace;
        this.events = events;
        this.context = context;
        this.config = config;
        this.signal = signal;
        this.persistence = persistence;
    }

    persistState() {
        if (this.persistence) {
            this.persistence.saveWorkflow(this.id, this, this.status);
        }
    }

    createBreakpoint(task: string, data: any) {
        console.log('🔴 Creating breakpoint for task:', task);
        if (this.tasks.has(task)) {
            this.executionContext.setState(state => ({
                ...state,
                breakpointId: uuidv4(),
                breakpointData: data,
                breakpointTask: task,
            }));

            // Make sure we persist state immediately
            if (this.persistence) {
                this.persistence.saveWorkflow(this.id, this, this.status);
            }

            console.log(`🔴 Breakpoint created for task "${task}" with data:`, data);
        } else {
            throw new Error(`Task "${task}" not found.`);
        }
    }

    on<T extends string>(event: T, callback: (data: any) => void) {
        this.events?.on(event, callback);
    }

    onAll(callback: (event: keyof TEvent, data: any) => void) {
        this.events?.onAll(callback);
    }

    addTask(name: string, config: TaskConfig<TEvent, TContext>) {
        this.tasks.set(name, config);
    }

    async start(initialTask: string, initialData?: any) {
        // Update status to running when workflow starts
        this.status = WorkflowStatus.PENDING;

        // Initialize context with initial data if provided
        if (initialData) {
            // Also update typed context if available
            if (this.context) {
                this.context.merge(initialData);
            }
        }
        await this.executeTask(initialTask, initialData);
    }

    async resume(workflowId: string, overideContext?: Partial<TContext>) {
        if (this.persistence) {
            const savedWorkflow: any = await this.persistence.loadWorkflow(workflowId);
            if (savedWorkflow) {
                console.log('🔴 Resuming workflow', savedWorkflow);

                // Properly deserialize the workflow state
                const deserializedState = this.deserializeState(savedWorkflow.workflowState);

                this.executionContext.setState((state: any) => ({
                    ...state,
                    ...deserializedState,
                    // Ensure these are properly converted back to Sets and Maps
                    runningTasks: deserializedState.runningTasks,
                    completedTasks: deserializedState.completedTasks,
                    taskData: deserializedState.taskData,
                }));

                // Restore event state
                if (this.events) {
                    this.events.setAllState(
                        this.deserializeState(JSON.parse(savedWorkflow.eventState))
                    );
                }

                // Restore context state
                if (this.context) {
                    this.context.merge(
                        this.deserializeState({
                            ...JSON.parse(savedWorkflow.contextState),
                        })
                    );
                    if (overideContext) {
                        this.context.merge(overideContext);
                    }

                    console.log('context', this.context);
                }

                // Restore task execution counts if available
                if (savedWorkflow.executionCounts) {
                    for (const [taskName, count] of Object.entries(savedWorkflow.executionCounts)) {
                        this.executionContext.setTaskExecutionCount(taskName, count as number);
                    }
                }

                if (this.tasks.has(savedWorkflow.workflowState.breakpointTask)) {
                    await this.executeTask(
                        savedWorkflow.workflowState.breakpointTask,
                        savedWorkflow.workflowState.breakpointData
                    );
                } else {
                    throw new Error(
                        `Task "${savedWorkflow.workflowState.breakpointTask}" not found.`
                    );
                }
            }
        }
    }

    // Add a deserializer method to handle the serialized data
    private deserializeState(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        // Handle serialized Set
        if (data && typeof data === 'object' && data.type === 'Set' && Array.isArray(data.value)) {
            return new Set(data.value);
        }

        // Handle serialized Map
        if (data && typeof data === 'object' && data.type === 'Map' && data.value) {
            return new Map(Object.entries(data.value));
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => this.deserializeState(item));
        }

        // Handle objects
        if (typeof data === 'object') {
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                result[key] = this.deserializeState(value);
            }
            return result;
        }

        // Return primitive values as is
        return data;
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
                redirectTo: () => {},
                interrupt: (data: any) => {
                    console.log('🚨 Task interrupted:', data);
                },
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('⏳ Task timeout exceeded')), timeoutMs)
            ),
        ]);
    }

    async executeTask(taskName: string, data?: any) {
        if (this.executionContext.isAborted() && !this.executionContext.isGracefulShutdown()) {
            console.log(`⚠️ Task "${taskName}" skipped due to workflow abortion.`);
            this.status = WorkflowStatus.ABORTED;
            return;
        }

        const config = this.tasks.get(taskName);
        if (!config) {
            console.error(`❌ Task "${taskName}" not found.`);
            this.executionContext.endTaskTiming(
                taskName,
                new Error(`Task "${taskName}" not found.`)
            );
            this.status = WorkflowStatus.FAILED;
            if (this.persistence) {
                await this.persistence.saveWorkflow(this.id, this, this.status);
            }
            throw new Error(`Task "${taskName}" not found.`);

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

        this.executionContext.startTaskTiming(taskName);

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
                          interrupt: (data: any) => {
                              console.log('🚨 Task interrupted:', data, taskName);
                              // Complete the current task before creating the breakpoint
                              this.executionContext.markTaskComplete(taskName, data);
                              this.createBreakpoint(taskName, data);
                              throw new BreakpointError('Breakpoint created');
                          },
                      });

                // Add this line to end timing for successful execution
                this.executionContext.endTaskTiming(taskName);

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
                if (this.persistence) {
                    await this.persistence.saveWorkflow(this.id, this, this.status);
                }
                // Emit an event with the updated execution count
                const executionCount = this.executionContext.getTaskExecutionCount(taskName);
                this.executionContext.emitTaskExecutionEvent(taskName, executionCount);

                if (
                    this.executionContext.isAborted() &&
                    !this.executionContext.isGracefulShutdown()
                ) {
                    console.log(`⚠️ Workflow stopped after task "${taskName}".`);
                    this.status = WorkflowStatus.ABORTED;
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
                        interrupt: (data: any) => {
                            console.log('🚨 Task interrupted:', data);
                            this.createBreakpoint(taskName, data);
                            throw new BreakpointError('Breakpoint created');
                        },
                    });
                }

                // Check for special "end" route value
                if (nextTasks === 'end') {
                    console.log(`🏁 Workflow ended after task "${taskName}".`);
                    this.status = WorkflowStatus.COMPLETED;
                    if (this.persistence) {
                        await this.persistence.saveWorkflow(this.id, this, this.status);
                    }
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
                if (this.persistence) {
                    await this.persistence.saveWorkflow(this.id, this, this.status);
                }
                return result;
            } catch (error) {
                this.executionContext.endTaskTiming(taskName, error as Error);
                attempt++;
                console.error(`❌ Error in task "${taskName}" (Attempt ${attempt}):`, error);

                if (error instanceof BreakpointError) {
                    console.log(`🔴 Breakpoint hit for task "${taskName}".`);
                    this.status = WorkflowStatus.INTERRUPTED;
                    if (this.persistence) {
                        await this.persistence.saveWorkflow(this.id, this, this.status);
                    }
                    return;
                }

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
                            interrupt: () => {},
                        });

                        if (errorResult.retry) {
                            if (attempt <= (config.retryCount || 0)) {
                                continue;
                            }
                        }

                        if (errorResult.result !== undefined) {
                            this.executionContext.markTaskComplete(taskName, errorResult.result);
                            if (this.persistence) {
                                await this.persistence.saveWorkflow(this.id, this, this.status);
                            }

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
                    this.status = WorkflowStatus.FAILED;
                    if (this.persistence) {
                        await this.persistence.saveWorkflow(this.id, this, this.status);
                    }
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
        this.status = graceful ? WorkflowStatus.ABORTED : WorkflowStatus.ABORTED;
        if (this.persistence) {
            this.persistence.saveWorkflow(this.id, this, this.status);
        }
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

    getTimingSummary() {
        return this.executionContext.getMainTimingSummary();
    }

    /**
     * Get the current status of the workflow
     */
    getStatus(): WorkflowStatus {
        return this.status;
    }

    /**
     * Set the workflow status
     */
    setStatus(status: WorkflowStatus): void {
        this.status = status;
        if (this.persistence) {
            this.persistence.saveWorkflow(this.id, this, this.status);
        }
    }

    /**
     * Interrupt the workflow and create a breakpoint
     */
    interrupt(taskName: string, data: any): void {
        console.log(`🔴 Interrupting workflow at task "${taskName}"`);
        this.status = WorkflowStatus.INTERRUPTED;
        this.createBreakpoint(taskName, data);
        if (this.persistence) {
            this.persistence.saveWorkflow(this.id, this, this.status);
        }
    }

    /**
     * Resume an interrupted workflow
     */
    async resumeInterrupted(): Promise<void> {
        if (this.status === WorkflowStatus.INTERRUPTED) {
            this.status = WorkflowStatus.PENDING;
            if (this.persistence) {
                await this.persistence.saveWorkflow(this.id, this, this.status);
            }
        } else {
            console.warn('Attempted to resume a workflow that is not in INTERRUPTED state');
        }
    }
}

export class BreakpointError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BreakpointError';
    }
}
