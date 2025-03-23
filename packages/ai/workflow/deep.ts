import { CoreAssistantMessage, CoreUserMessage } from 'ai';
import { Langfuse } from 'langfuse';
import { WorkflowBuilder } from './builder';
import { createContext } from './context';
import { createTypedEventEmitter } from './events';
import {
        analysisTask,
        completionTask,
        modeRoutingTask,
        plannerTask,
        refineQueryTask,
        reflectorTask,
        webSearchTask,
        writerTask
} from './tasks';


export enum CompletionMode {
        Fast = "fast",
        Deep = "deep",
        O3_Mini = "o3-mini",
        GPT_4o_Mini = "gpt-4o-mini",
        GEMINI_2_FLASH = "gemini-flash-2.0",
        DEEPSEEK_R1 = "deepseek-r1",
        CLAUDE_3_5_SONNET = "claude-3-5-sonnet",
        CLAUDE_3_7_SONNET = "claude-3-7-sonnet",
}

// Define the workflow schema type
export type WorkflowEventSchema = {
        flow: {
                query: string;
                threadId: string;
                threadItemId: string;
                status: "PENDING" | "COMPLETED" | "FAILED";
                goals?: Record<string, {
                        id: number;
                        text: string;
                        final: boolean;
                        status?: "PENDING" | "COMPLETED" | "FAILED";
                }>;
                steps?: Record<string, {
                        type: string;
                        final: boolean;
                        goalId?: number;
                        queries?: string[];
                        results?: {
                                title: string;
                                link: string;
                        }[];
                }>;
                toolCalls?: any[];
                toolResults?: any[];
                reasoning?: {
                        text: string;
                        final: boolean;
                        status?: "PENDING" | "COMPLETED" | "FAILED";
                };
                answer: {
                        text: string;
                        object?: any;
                        objectType?: string;
                        final: boolean;
                        status?: "PENDING" | "COMPLETED" | "FAILED";
                };
                final: boolean;
        };
};

// Define the context schema type
export type WorkflowContextSchema = {
        mcpConfig: Record<string, string>;
        question: string;
        search_queries: string[];
        messages: {
                role: "user" | "assistant";
                content: string;
        }[];
        mode: CompletionMode;
        goals: {
                id: number;
                text: string;
                final: boolean;
                status: "PENDING" | "COMPLETED" | "FAILED";
        }[];
        steps: {
                type: string;
                final: boolean;
                goalId: number;
                queries?: string[];
                results?: {
                        title: string;
                        link: string;
                }[];
        }[];
        queries: string[];
        summaries: string[];
        answer: string[];
        threadId: string;
        threadItemId: string;
};

// Replace Zod schemas with TypeScript types
const workflowEventInitialState: Partial<WorkflowEventSchema> = {
        flow: {
                query: "",
                threadId: "",
                threadItemId: "",
                status: 'PENDING',
                goals: {},
                steps: {},
                answer: {
                        text: "",
                        final: false
                },
                final: false
        }
};

export type WorkflowConfig = {
        maxIterations?: number;
        maxRetries?: number;
        timeoutMs?: number;
        retryDelayMs?: number;
        retryDelayMultiplier?: number;
        signal?: AbortSignal;
};

export const deepResearchWorkflow = ({
        mcpConfig = {},
        mode,
        question, 
        threadId, 
        threadItemId,
        messages,
        config = {},
        signal
}: {
        mcpConfig: Record<string, string>,
        mode: CompletionMode,
        question: string, 
        threadId: string, 
        threadItemId: string,
        messages: (CoreUserMessage | CoreAssistantMessage)[],
        config?: WorkflowConfig,
        signal?: AbortSignal
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
        const events = createTypedEventEmitter<WorkflowEventSchema>({
                flow: {
                        query: question,
                        threadId,
                        threadItemId,
                        status: 'PENDING',
                        goals: {},
                        steps: {},
                        answer: {
                                text: "",
                                final: false,
                                status: 'PENDING'
                        },
                        final: false,
                }
        });

        const context = createContext<WorkflowContextSchema>({
                mcpConfig,
                question,
                mode,
                search_queries: [],
                messages: messages as any,
                goals: [],
                queries: [],
                steps: [],
                summaries: [],
                answer: [],
                threadId,
                threadItemId
        });

        // Use the typed builder
        const builder = new WorkflowBuilder({
                trace,
                initialEventState: events.getAllState().flow,
                events,
                context,
                config: workflowConfig,
                signal
        });
        
        builder.addTasks([
                plannerTask,
                webSearchTask,
                reflectorTask,
                analysisTask,
                writerTask,
                refineQueryTask,
                modeRoutingTask,
                completionTask
        ]);

        return builder.build();
};
