import {
    createContext,
    createTypedEventEmitter,
    WorkflowBuilder,
    WorkflowConfig,
} from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { CoreAssistantMessage, CoreUserMessage } from 'ai';
import { Langfuse } from 'langfuse';
import {
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

type Status = 'PENDING' | 'COMPLETED' | 'ERROR';

// Define the workflow schema type
export type WorkflowEventSchema = {
    flow: {
        query: string;
        threadId: string;
        threadItemId: string;
        status: Status;
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
        toolCalls?: any[];
        toolResults?: any[];
        answer: {
            text: string;
            object?: any;
            objectType?: string;
            status: Status;
        };
        mode: ChatMode;
        suggestions?: string[];
    };
};

// Define the context schema type
export type WorkflowContextSchema = {
    mcpConfig: Record<string, string>;
    question: string;
    search_queries: string[];
    messages: {
        role: 'user' | 'assistant';
        content: string;
    }[];
    mode: ChatMode;
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
    answer: string | undefined;
    threadId: string;
    threadItemId: string;
    showSuggestions: boolean;
    onFinish: (data: any) => void;
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
}: {
    mcpConfig: Record<string, string>;
    mode: ChatMode;
    question: string;
    threadId: string;
    threadItemId: string;
    messages: (CoreUserMessage | CoreAssistantMessage)[];
    config?: WorkflowConfig;
    signal?: AbortSignal;
    webSearch?: boolean;
    showSuggestions?: boolean;
    onFinish: (data: any) => void;
}) => {
    const langfuse = new Langfuse();
    const trace = langfuse.trace({
        name: 'deep-research-workflow',
    });

    // Set default values for config
    const workflowConfig: WorkflowConfig = {
        maxIterations: 5,
        ...config,
    };

    // Create typed event emitter with the proper type
    const events = createTypedEventEmitter<WorkflowEventSchema>({
        flow: {
            query: question,
            mode: mode as ChatMode,
            threadId,
            threadItemId,
            status: 'PENDING',
            steps: {},
            answer: {
                text: '',
                status: 'PENDING',
            },
        },
    });

    const context = createContext<WorkflowContextSchema>({
        mcpConfig,
        question,
        mode,
        webSearch,
        search_queries: [],
        messages: messages as any,
        goals: [],
        queries: [],
        steps: [],
        summaries: [],
        answer: undefined,
        threadId,
        threadItemId,
        showSuggestions,
        onFinish: onFinish as any,
    });

    // Use the typed builder
    const builder = new WorkflowBuilder({
        trace,
        initialEventState: events.getAllState().flow,
        events,
        context,
        config: workflowConfig,
        signal,
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
    ]);

    return builder.build();
};
