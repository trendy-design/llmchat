import { ContextSchemaDefinition } from './context';
import { EventSchemaDefinition } from './events';
import { TaskDefinition } from './types';

export const createTask = <
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
>(
    taskDef: TaskDefinition<TEvent, TContext>
): TaskDefinition<TEvent, TContext> => {
    return taskDef;
};
