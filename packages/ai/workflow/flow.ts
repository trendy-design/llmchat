import {
    createContext,
    createTypedEventEmitter,
    PersistenceLayer,
    WorkflowBuilder,
    WorkflowConfig,
} from '@repo/orchestrator';
import { prisma } from '@repo/prisma';
import { ChatMode } from '@repo/shared/config';
import { Answer, WorkflowEventSchema } from '@repo/shared/types';
import { Geo } from '@vercel/functions';
import { CoreMessage } from 'ai';
import { Langfuse } from 'langfuse';
import { MCPToolManager } from '../tools/MCPToolManager';
import {
    agenticTask,
    analysisTask,
    completionTask,
    modeRoutingTask,
    plannerTask,
    proSearchTask,
    quickSearchTask,
    refineQueryTask,
    reflectorTask,
    suggestionsTask,
    webSearchTask,
    writerTask,
} from './tasks';

// Define the context schema type
export type WorkflowContextSchema = {
    mcpConfig: Record<string, string>;
    mcpToolManager?: any;
    question: string;
    search_queries: string[];
    messages: CoreMessage[];
    mode: ChatMode;
    interupted: boolean;
    goals: {
        id: number;
        text: string;
        final: boolean;
        status: 'PENDING' | 'COMPLETED' | 'ERROR';
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
    agenticPlan?: {
        plan: string[];
        reasoning: string;
    };
    webSearch: boolean;
    queries: string[];
    summaries: string[];
    gl?: Geo;
    sources: {
        index: number;
        title: string;
        link: string;
    }[];
    answer: Answer | undefined;
    threadId: string;
    threadItemId: string;
    showSuggestions: boolean;
    customInstructions?: string;
    onFinish: (data: any) => void;
    waitForApproval: boolean;
    waitForApprovalMetadata: any;
};

export const runWorkflow = async ({
    mcpConfig = {},
    mode,
    question,
    threadId,
    threadItemId,
    messages,
    config = {},
    signal,
    webSearch = false,
    showSuggestions = false,
    onFinish,
    customInstructions,
    gl,
}: {
    mcpConfig: Record<string, string>;
    mode: ChatMode;
    question: string;
    threadId: string;
    threadItemId: string;
    messages: CoreMessage[];
    config?: WorkflowConfig;
    signal?: AbortSignal;
    webSearch?: boolean;
    showSuggestions?: boolean;
    onFinish?: (data: any) => void;
    gl?: Geo;
    customInstructions?: string;
}) => {
    const langfuse = new Langfuse();
    const trace = langfuse.trace({
        name: 'deep-research-workflow',
    });

    // Set default values for config
    const workflowConfig: WorkflowConfig = {
        maxIterations: 2,
        timeoutMs: 480000, // Add default timeout of
        ...config,
    };

    // Initialize MCPToolManager at workflow startup if mcpConfig is provided
    let mcpToolManager;
    if (Object.keys(mcpConfig).length > 0) {
        try {
            mcpToolManager = await MCPToolManager.create(mcpConfig);
            await mcpToolManager?.initialize({ shouldExecute: false });
            console.log('MCPToolManager initialized successfully at workflow start');
        } catch (error) {
            console.error('Failed to initialize MCPToolManager:', error);
        }
    }

    // Create typed event emitter with the proper type
    const events = createTypedEventEmitter<WorkflowEventSchema>({
        schemaVersion: 1,
        steps: {},
        answer: {
            status: 'PENDING',
            message: undefined,
        },
        sources: [],
        suggestions: [],
        object: {},
        error: {
            error: '',
            status: 'PENDING',
        },
        status: 'PENDING',
    });

    const context = createContext<WorkflowContextSchema>({
        mcpConfig,
        mcpToolManager,
        question,
        mode,
        webSearch,
        interupted: false,
        search_queries: [],
        messages: messages as any,
        goals: [],
        queries: [],
        steps: [],
        gl,
        agenticPlan: undefined,
        customInstructions,
        sources: [],
        summaries: [],
        answer: undefined,
        threadId,
        threadItemId,
        showSuggestions,
        onFinish: onFinish as any,
        waitForApproval: false,
        waitForApprovalMetadata: undefined,
    });

    const persistence = new PersistenceLayer<WorkflowEventSchema, WorkflowContextSchema>({
        save: async (key, data) => {
            await prisma.workflow.upsert({
                where: { id: key },
                update: {
                    ...data,
                    id: key,
                    contextState: JSON.stringify(data.contextState),
                    eventState: JSON.stringify(data.eventState),
                    status: data.status,
                },
                create: {
                    ...data,
                    id: key,
                    contextState: JSON.stringify(data.contextState),
                    eventState: JSON.stringify(data.eventState),
                    status: data.status,
                },
            });
        },
        load: async key => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: key },
            });
            return workflow as any;
        },
        delete: async key => {
            await prisma.workflow.delete({
                where: { id: key },
            });
        },
        exists: async key => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: key },
            });
            return !!workflow;
        },
    });

    // Use the typed builder
    const builder = new WorkflowBuilder(threadId, {
        trace,
        initialEventState: events.getAllState(),
        events,
        context,
        config: workflowConfig,
        signal,
        persistence,
    });

    builder.addTasks([
        plannerTask,
        webSearchTask,
        reflectorTask,
        analysisTask,
        writerTask,
        refineQueryTask,
        modeRoutingTask,
        completionTask,
        suggestionsTask,
        quickSearchTask,
        proSearchTask,
        agenticTask,
    ]);

    return Promise.resolve(builder.build());
};
