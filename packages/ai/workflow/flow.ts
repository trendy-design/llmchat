import {
    createContext,
    createTypedEventEmitter,
    PersistenceLayer,
    WorkflowBuilder,
    WorkflowConfig,
} from '@repo/orchestrator';
import { prisma } from '@repo/prisma';
import { ChatMode } from '@repo/shared/config';
import { Answer } from '@repo/shared/types';
import { Geo } from '@vercel/functions';
import { CoreMessage } from 'ai';
import { Langfuse } from 'langfuse';
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
type Status = 'PENDING' | 'COMPLETED' | 'ERROR' | 'HUMAN_REVIEW';

// Define the workflow schema type
export type WorkflowEventSchema = {
    steps?: Record<
        string,
        {
            id: number;
            text?: string;
            steps: Record<
                string,
                {
                    data?: any;
                    status: Status;
                }
            >;
            status: Status;
        }
    >;
    answer: Answer;
    sources?: {
        index: number;
        title: string;
        link: string;
    }[];
    object?: Record<string, any>;
    error?: {
        error: string;
        status: Status;
    };
    status: Status;
    suggestions?: string[];
    breakpoint?: {
        id?: string;
        data?: any;
    };
};

// Define the context schema type
export type WorkflowContextSchema = {
    mcpConfig: Record<string, string>;
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

export const runWorkflow = ({
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

    // Create typed event emitter with the proper type
    const events = createTypedEventEmitter<WorkflowEventSchema>({
        steps: {},
        answer: {
            text: '',
            status: 'PENDING',
            messages: [],
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
                    workflowConfig: JSON.stringify(data.workflowConfig),
                    contextState: JSON.stringify(data.contextState),
                    eventState: JSON.stringify(data.eventState),
                },
                create: {
                    ...data,
                    id: key,
                    workflowConfig: JSON.stringify(data.workflowConfig),
                    contextState: JSON.stringify(data.contextState),
                    eventState: JSON.stringify(data.eventState),
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

    return builder.build();
};
