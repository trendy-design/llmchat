import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { WorkflowConfig } from './deep';
import { WorkflowEngine } from './engine';
import { EventSchemaDefinition, TypedEventEmitter } from './events';
import { TaskDefinition } from './task';

export type WorkflowBuilderOptions<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = {
  trace?: LangfuseTraceClient;
  initialEventState?: Record<string, any>;
  events?: TypedEventEmitter<TEvent>;
  context?: Context<TContext>;
  config?: WorkflowConfig;
};

export class WorkflowBuilder<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> {
  private tasks: TaskDefinition<TEvent, TContext>[] = [];
  private options: WorkflowBuilderOptions<TEvent, TContext>;

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
    const workflow = new WorkflowEngine<TEvent, TContext>({
      trace: this.options.trace,
      initialEventState: this.options.initialEventState,
      events: this.options.events,
      context: this.options.context,
      config: this.options.config
    });

    for (const taskDef of this.tasks) {
      workflow.task({
        name: taskDef.name,
        execute: taskDef.execute,
        route: taskDef.route,
        dependencies: taskDef.dependencies,
        retryCount: taskDef.retryCount,
        timeoutMs: taskDef.timeoutMs
      });
    }

    return workflow;
  }
} 