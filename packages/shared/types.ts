import { CoreMessage as AICoreMessage } from 'ai';
import { ChatMode } from './config';

export type Project = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
};

export type Thread = {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    pinned: boolean;
    pinnedAt: Date;
    projectId?: string;
};

export type SubStep = {
    data?: any;
    status: ItemStatus;
};

export type ItemStatus = 'QUEUED' | 'PENDING' | 'COMPLETED' | 'ERROR' | 'ABORTED' | 'HUMAN_REVIEW';

export type Step = {
    id: string;
    text?: string;
    steps?: Record<string, SubStep>;
    status: ItemStatus;
};
export type Source = {
    title: string;
    link: string;
    index: number;
    snippet?: string;
};

export type ToolCall = {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: any;
};

export type ToolResult = {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    result: any;
};

export type AnswerObject = {
    id: string;
    type: 'object';
    object: Record<string, any>;
};

export type AnswerText = {
    id: string;
    type: 'text';
    text: string;
    isFullText: boolean;
};

export type AnswerToolResult = ToolResult & {
    id: string;
    approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING' | 'AUTO_APPROVED' | 'RUNNING';
};

export type AnswerToolCall = ToolCall & {
    id: string;
    approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING' | 'AUTO_APPROVED' | 'RUNNING';
};

export type AnswerMessage = AnswerObject | AnswerText | AnswerToolCall | AnswerToolResult;

export type Answer = {
    text: string; // deprecated
    isChunk?: boolean; // deprecated
    messages?: Array<AnswerMessage>;
    status?: ItemStatus;
};

export type AnswerEvent = {
    status: ItemStatus;
    message?: AnswerMessage;
};

// Define the workflow schema type
export type WorkflowEventSchema = {
    schemaVersion: number;
    steps?: Record<
        string,
        {
            id: number;
            text?: string;
            steps: Record<
                string,
                {
                    data?: any;
                    status: ItemStatus;
                }
            >;
            status: ItemStatus;
        }
    >;
    answer: AnswerEvent;
    sources?: {
        index: number;
        title: string;
        link: string;
    }[];
    object?: Record<string, any>;
    error?: {
        error: string;
        status: ItemStatus;
    };
    status: ItemStatus;
    suggestions?: string[];
    breakpoint?: {
        id?: string;
        data?: any;
    };
};

export type ThreadItem = {
    schemaVersion: number;
    query: string;
    steps?: Record<string, Step>;
    answer?: Answer;
    status?: ItemStatus;
    createdAt: Date;
    updatedAt: Date;
    id: string;
    parentId?: string;
    threadId: string;
    metadata?: Record<string, any>;
    mode: ChatMode;
    error?: string;
    suggestions?: string[];
    persistToDB?: boolean;
    sources?: Source[];
    object?: Record<string, any>;
    breakpoint?: {
        id?: string;
        data?: any;
    };
    imageAttachment?: string;
};

export type MessageGroup = {
    userMessage: ThreadItem;
    assistantMessages: ThreadItem[];
};

export type CoreMessage = AICoreMessage;
