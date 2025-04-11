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
};

export type AnswerToolResult = ToolResult & {
    id: string;
    approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING';
};

export type AnswerToolCall = ToolCall & {
    id: string;
    approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING';
};

export type AnswerMessage = AnswerObject | AnswerText | AnswerToolCall | AnswerToolResult;

export type Answer = {
    text: string;
    finalText?: string;
    messages?: Array<AnswerMessage>;
    status?: ItemStatus;
};

export type ThreadItem = {
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
