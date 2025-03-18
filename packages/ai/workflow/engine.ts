import { EventEmitter } from 'events';
import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { WorkflowConfig } from './deep'; // Import the config type
import { EventSchemaDefinition, TypedEventEmitter } from './events';

type TaskParams<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = {
        data?: any;
        executionContext: ExecutionContext;
        abort: (graceful: boolean) => void;
        trace?: LangfuseTraceClient;
        events?: TypedEventEmitter<TEvent>;
        context?: Context<TContext>;
        config?: WorkflowConfig; // Add config parameter
}

type TaskRouterParams<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = TaskParams<TEvent, TContext> & {
        result: any;
}

// Add a new type for parallel task routing with custom data
type ParallelTaskRoute = {
  task: string;
  data?: any;
};

type TaskExecutionFunction<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = (params: TaskParams<TEvent, TContext>) => Promise<any>;

type TaskRouterFunction<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = (params: TaskRouterParams<TEvent, TContext>) => string | string[] | ParallelTaskRoute[] | undefined;

export type WorkflowContextData = {
        [key: string]: any;
};

export type TaskConfig<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = {
        execute: (params: TaskParams<TEvent, TContext>) => Promise<any>;
        route: (params: TaskRouterParams<TEvent, TContext>) => string | string[] | ParallelTaskRoute[] | undefined;
        dependencies?: string[];
        retryCount?: number;
        timeoutMs?: number;
}

export type WorkflowState = {
        completedTasks: Set<string>;
        runningTasks: Set<string>;
        taskData: Map<string, any>;
}

export type TaskOptions = {
        name: string;
        execute: TaskExecutionFunction<any, any>;
        route?: TaskRouterFunction<any, any>;
        dependencies?: string[];
        retryCount?: number;
        timeoutMs?: number;
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
                console.log(graceful ? '🟡 Gracefully stopping workflow...' : '🚨 Workflow aborted immediately!');
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
  TContext extends ContextSchemaDefinition = any
> {
        private tasks: Map<string, TaskConfig<TEvent, TContext>>;
        private eventEmitter: EventEmitter;
        private executionContext: ExecutionContext;
        private trace?: LangfuseTraceClient;
        private events?: TypedEventEmitter<TEvent>;
        private context?: Context<TContext>;
        private config?: WorkflowConfig; // Add config field

        constructor({
                trace,
                initialEventState,
                events,
                context,
                config
        }: {
                trace?: LangfuseTraceClient, 
                initialEventState?: EventPayload,
                events?: TypedEventEmitter<TEvent>,
                context?: Context<TContext>,
                config?: WorkflowConfig // Add config parameter
        }) {
                this.tasks = new Map();
                this.eventEmitter = new EventEmitter();
                this.executionContext = new ExecutionContext(this.eventEmitter);
                this.trace = trace;
                this.events = events;
                this.context = context;
                this.config = config;
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

        async executeTaskWithTimeout(task: TaskExecutionFunction<TEvent, TContext>, data: any, timeoutMs: number) {
                return Promise.race([
                        task({ 
                                data, 
                                executionContext: this.executionContext, 
                                abort: this.executionContext.abortWorkflow.bind(this.executionContext), 
                                trace: this.trace,
                                events: this.events,
                                context: this.context,
                                config: this.config
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('⏳ Task timeout exceeded')), timeoutMs)),
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

                if (config.dependencies && !config.dependencies.every(dep => this.executionContext.isTaskComplete(dep))) {
                        console.log(`⏳ Task "${taskName}" is waiting for dependencies: ${config.dependencies.join(', ')}`);
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
                // if (data !== undefined) {
                //         console.log(`   with data:`, data);
                // }
                // console.log(`   with context:`, this.ctx);

                let attempt = 0;
                while (attempt <= (config.retryCount || 0)) {
                        try {
                                const result = config.timeoutMs
                                        ? await this.executeTaskWithTimeout(config.execute, data, config.timeoutMs)
                                        : await config.execute({ 
                                                data, 
                                                executionContext: this.executionContext, 
                                                abort: this.executionContext.abortWorkflow.bind(this.executionContext), 
                                                trace: this.trace,
                                                events: this.events,
                                                context: this.context,
                                                config: this.config
                                          });

                                this.executionContext.markTaskComplete(taskName, result);
                                
                                // Emit an event with the updated execution count
                                const executionCount = this.executionContext.getTaskExecutionCount(taskName);
                                this.executionContext.emitTaskExecutionEvent(taskName, executionCount);

                                if (this.executionContext.isAborted() && !this.executionContext.isGracefulShutdown()) {
                                        console.log(`⚠️ Workflow stopped after task "${taskName}".`);
                                        return result;
                                }

                                const nextTasks = config.route({ 
                                        result, 
                                        executionContext: this.executionContext, 
                                        abort: this.executionContext.abortWorkflow.bind(this.executionContext), 
                                        trace: this.trace,
                                        events: this.events,
                                        context: this.context
                                });
                                
                                // Check for special "end" route value
                                if (nextTasks === "end") {
                                        console.log(`🏁 Workflow ended after task "${taskName}".`);
                                        return result;
                                }
                                
                                if (nextTasks) {
                                        if (Array.isArray(nextTasks)) {
                                                if (nextTasks.length > 0 && typeof nextTasks[0] === 'object' && 'task' in nextTasks[0]) {
                                                        // Handle ParallelTaskRoute[] format
                                                        await Promise.all(
                                                                (nextTasks as ParallelTaskRoute[]).map(route => 
                                                                        this.executeTask(route.task, route.data !== undefined ? route.data : result)
                                                                )
                                                        );
                                                } else {
                                                        // Handle string[] format (all tasks get the same data)
                                                        await Promise.all((nextTasks as string[]).map(nextTask => this.executeTask(nextTask, result)));
                                                }
                                        } else {
                                                await this.executeTask(nextTasks as string, result);
                                        }
                                }
                                return result;
                        } catch (error) {
                                attempt++;
                                console.error(`❌ Error in task "${taskName}" (Attempt ${attempt}):`, error);
                                if (attempt > (config.retryCount || 0)) {
                                        console.error(`⛔ Task "${taskName}" failed after ${attempt} attempts.`);
                                        return;
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
                        timeoutMs: options.timeoutMs
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
