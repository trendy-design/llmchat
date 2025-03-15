import { Langfuse } from 'langfuse';
import { z } from 'zod';
import { WorkflowBuilder } from './builder';
import { createContext } from './context';
import { createTypedEventEmitter } from './events';
import {
        finalAnswerTask,
        initiatorTask,
        reflectorTask,
        webSearchSummaryTask,
        webSearchTask
} from './tasks';

// Define the workflow schema type
export type WorkflowEventSchema = {
        flow: z.ZodObject<{
                query: z.ZodString;
                threadId: z.ZodString;
                threadItemId: z.ZodString;
                status: z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>;
                goals: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                        id: z.ZodNumber;
                        text: z.ZodString;
                        final: z.ZodBoolean;
                        status: z.ZodOptional<z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>>;
                }>>>;
                steps: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                        type: z.ZodString;
                        final: z.ZodBoolean;
                        goalId: z.ZodOptional<z.ZodNumber>;
                        queries: z.ZodOptional<z.ZodArray<z.ZodString>>;
                        results: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                title: z.ZodString;
                                link: z.ZodString;
                        }>>>;
                }>>>;
                answer: z.ZodObject<{
                        text: z.ZodString;
                        final: z.ZodBoolean;
                        status: z.ZodOptional<z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>>;
                }>;
                final: z.ZodBoolean;
        }>;
};

// Define the context schema type
export type WorkflowContextSchema = {
        question: z.ZodString;
        search_queries: z.ZodArray<z.ZodString>;
        goals: z.ZodArray<z.ZodObject<{
                id: z.ZodNumber;
                text: z.ZodString;
                final: z.ZodBoolean;
                status: z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>;
        }>>;
        steps: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                final: z.ZodBoolean;
                goalId: z.ZodNumber;
                queries: z.ZodOptional<z.ZodArray<z.ZodString>>;
                results: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        title: z.ZodString;
                        link: z.ZodString;
                }>>>;
        }>>;
        summaries: z.ZodArray<z.ZodString>;
        answer: z.ZodArray<z.ZodString>;
        threadId: z.ZodString;
        threadItemId: z.ZodString;
};

// Define your event schemas
const workflowEventSchemas = {
        flow: z.object({
                query: z.string(),
                threadId: z.string(),
                threadItemId: z.string(),
                status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
                goals: z.record(z.string(), z.object({
                        id: z.number(),
                        text: z.string(),
                        final: z.boolean(),
                        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional()
                })).optional(),
                steps: z.record(z.string(), z.object({
                        type: z.string(),
                        final: z.boolean(),
                        goalId: z.number().optional(),
                        queries: z.array(z.string()).optional(),
                        results: z.array(z.object({
                                title: z.string(),
                                link: z.string()
                        })).optional()
                })).optional(),
                answer: z.object({
                        text: z.string(),
                        final: z.boolean(),
                        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional()
                }),
                final: z.boolean()
        })
} satisfies WorkflowEventSchema;

// Define your context schemas
const workflowContextSchemas = {
        question: z.string(),
        search_queries: z.array(z.string()),
        goals: z.array(z.object({
                id: z.number(),
                text: z.string(),
                final: z.boolean(),
                status: z.enum(['PENDING', 'COMPLETED', 'FAILED'])
        })),
        steps: z.array(z.object({
                type: z.string(),
                final: z.boolean(),
                goalId: z.number(),
                queries: z.array(z.string()).optional(),
                results: z.array(z.object({
                        title: z.string(),
                        link: z.string()
                })).optional()
        })),
        summaries: z.array(z.string()),
        answer: z.array(z.string()),
        threadId: z.string(),
        threadItemId: z.string()
} satisfies WorkflowContextSchema;

// Add a configuration type
export type WorkflowConfig = {
        maxIterations?: number;
        // Add other config parameters here as needed
};

export const deepResearchWorkflow = ({
        question, 
        threadId, 
        threadItemId,
        config = {} // Add config parameter with default empty object
}: {
        question: string, 
        threadId: string, 
        threadItemId: string,
        config?: WorkflowConfig
}) => {
        const langfuse = new Langfuse();
        const trace = langfuse.trace({
                name: 'deep-research-workflow',
        });

        // Set default values for config
        const workflowConfig: WorkflowConfig = {
                maxIterations: 5,
                ...config
        };

        // Create typed event emitter with the proper type
        const events = createTypedEventEmitter<WorkflowEventSchema>(workflowEventSchemas, {
                flow: {
                        query: question,
                        threadId,
                        threadItemId,
                        status: 'PENDING',
                        goals: {},
                        steps: {},
                        answer: {
                                text: "",
                                final: false
                        },
                        final: false
                }
        });

        // Create typed context with the proper type
        const context = createContext<WorkflowContextSchema>(workflowContextSchemas, {
                question,
                search_queries: [],
                goals: [],
                steps: [],
                summaries: [],
                answer: []
        });

        // Use the typed builder
        const builder = new WorkflowBuilder({
                trace,
                initialEventState: events.getAllState().flow,
                events,
                context,
                config: workflowConfig // Pass the config to the builder
        });
        
        builder.addTasks([
                initiatorTask,
                webSearchTask,
                webSearchSummaryTask,
                reflectorTask,
                finalAnswerTask
        ]);

        return builder.build();
};
