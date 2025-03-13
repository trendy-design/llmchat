import { LangfuseTraceClient } from 'langfuse';
import { Context, ContextSchemaDefinition } from './context';
import { ExecutionContext } from './engine';
import { EventSchemaDefinition, TypedEventEmitter } from './events';

// Define a WorkflowConfig type
export type WorkflowConfig = {
  maxIterations?: number;
  [key: string]: any;
};

export type TaskParams<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = {
  data?: any;
  executionContext: ExecutionContext;
  abort: (graceful: boolean) => void;
  trace?: LangfuseTraceClient;
  events?: TypedEventEmitter<TEvent>;
  context?: Context<TContext>;
  config?: WorkflowConfig;
};

export type TaskRouterParams<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = TaskParams<TEvent, TContext> & {
  result: any;
};

export type TaskDefinition<
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
> = {
  name: string;
  execute: (params: TaskParams<TEvent, TContext>) => Promise<any>;
  route?: (params: TaskRouterParams<TEvent, TContext>) => string | string[] | undefined;
  dependencies?: string[];
  retryCount?: number;
  timeoutMs?: number;
};

export const createTask = <
  TEvent extends EventSchemaDefinition = any,
  TContext extends ContextSchemaDefinition = any
>(taskDef: TaskDefinition<TEvent, TContext>): TaskDefinition<TEvent, TContext> => {
  return taskDef;
}; 