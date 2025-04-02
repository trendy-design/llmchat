import { TaskParams } from '@repo/orchestrator';
import {
    CoreMessage,
    extractReasoningMiddleware,
    generateObject as generateObjectAi,
    streamText,
    ToolSet,
} from 'ai';
import { format } from 'date-fns';
import { ZodSchema } from 'zod';
import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import { generateErrorMessage } from './tasks/utils';

export const generateText = async ({
    prompt,
    model,
    onChunk,
    messages,
    onReasoning,
    tools,
    onToolCall,
    onToolResult,
    signal,
    toolChoice = 'auto',
    maxSteps = 2,
}: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: CoreMessage[];
    onReasoning?: (chunk: string) => void;
    tools?: ToolSet;
    onToolCall?: (toolCall: any) => void;
    onToolResult?: (toolResult: any) => void;
    signal?: AbortSignal;
    toolChoice?: 'auto' | 'none' | 'required';
    maxSteps?: number;
}) => {
    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        const middleware = extractReasoningMiddleware({
            tagName: 'think',
            separator: '\n',
        });

        const selectedModel = getLanguageModel(model, middleware);
        const { fullStream } = !!messages?.length
            ? streamText({
                  system: prompt,
                  model: selectedModel,
                  messages,
                  tools,
                  maxSteps,
                  toolChoice: toolChoice as any,
                  abortSignal: signal,
              })
            : streamText({
                  prompt,
                  model: selectedModel,
                  tools,
                  maxSteps,
                  toolChoice: toolChoice as any,
                  abortSignal: signal,
              });
        let fullText = '';
        let reasoning = '';

        for await (const chunk of fullStream) {
            if (signal?.aborted) {
                throw new Error('Operation aborted');
            }

            if (chunk.type === 'text-delta') {
                fullText += chunk.textDelta;
                onChunk?.(chunk.textDelta, fullText);
            }
            if (chunk.type === 'reasoning') {
                reasoning += chunk.textDelta;
                onReasoning?.(reasoning);
            }
            if (chunk.type === 'tool-call') {
                onToolCall?.(chunk);
            }
            if (chunk.type === ('tool-result' as any)) {
                onToolResult?.(chunk);
            }

            if (chunk.type === 'error') {
                console.error(chunk.error);
                return Promise.reject(chunk.error);
            }
        }
        return Promise.resolve(fullText);
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
};

export const generateObject = async ({
    prompt,
    model,
    schema,
    messages,
    signal,
}: {
    prompt: string;
    model: ModelEnum;
    schema: ZodSchema;
    messages?: CoreMessage[];
    signal?: AbortSignal;
}) => {
    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        const selectedModel = getLanguageModel(model);
        const { object } = !!messages?.length
            ? await generateObjectAi({
                  system: prompt,
                  model: selectedModel,
                  schema,
                  messages,
                  abortSignal: signal,
              })
            : await generateObjectAi({
                  prompt,
                  model: selectedModel,
                  schema,
                  abortSignal: signal,
              });

        return JSON.parse(JSON.stringify(object));
    } catch (error) {
        console.error(error);
        return null;
    }
};

export type EventSchema<T extends Record<string, any>> = {
    [K in keyof T]: (current: T[K] | undefined) => T[K];
};

export class EventEmitter<T extends Record<string, any>> {
    private listeners: Map<string, ((data: any) => void)[]> = new Map();
    private state: Partial<T> = {};

    constructor(initialState?: Partial<T>) {
        this.state = initialState || {};
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
        return this;
    }

    off(event: string, callback: (data: any) => void) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }

    emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
        return this;
    }

    getState(): Partial<T> {
        return { ...this.state };
    }

    updateState<K extends keyof T>(key: K, updater: (current: T[K] | undefined) => T[K]) {
        this.state[key] = updater(this.state[key]);
        return this;
    }
}

export function createEventManager<T extends Record<string, any>>(
    initialState?: Partial<T>,
    schema?: EventSchema<T>
) {
    const emitter = new EventEmitter<T>(initialState);

    return {
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter),
        getState: emitter.getState.bind(emitter),
        update: <K extends keyof T>(
            key: K,
            value: T[K] | ((current: T[K] | undefined) => T[K])
        ) => {
            const updater =
                typeof value === 'function'
                    ? (value as (current: T[K] | undefined) => T[K])
                    : () => value;

            emitter.updateState(key, updater);
            emitter.emit('stateChange', {
                key,
                value: emitter.getState()[key],
            });
            return emitter.getState();
        },
    };
}

export const getHumanizedDate = () => {
    return format(new Date(), 'MMMM dd, yyyy, h:mm a');
};

export const getSERPResults = async (queries: string[]) => {
    const myHeaders = new Headers();
    const apiKey = process.env.SERPER_API_KEY || (self as any).SERPER_API_KEY || '';

    if (!apiKey) {
        throw new Error('SERPER_API_KEY is not configured');
    }

    myHeaders.append('X-API-KEY', apiKey);
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify(
        queries.slice(0, 3).map(query => ({
            q: query,
        }))
    );

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`SERP API responded with status: ${response.status}`);
        }

        const batchResult = await response.json();

        const organicResultsLists =
            batchResult?.map((result: any) => result.organic?.slice(0, 10)) || [];
        const allOrganicResults = organicResultsLists.flat();
        const uniqueOrganicResults = allOrganicResults.filter(
            (result: any, index: number, self: any[]) =>
                index === self.findIndex((r: any) => r?.link === result?.link)
        );

        return uniqueOrganicResults.slice(0, 10).map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getWebPageContent = async (url: string) => {
    try {
        const result = await readURL(url);
        const title = result?.title ? `# ${result.title}\n\n` : '';
        const description = result?.description
            ? `${result.description}\n\n ${result.markdown}\n\n`
            : '';
        const sourceUrl = result?.url ? `Source: [${result.url}](${result.url})\n\n` : '';
        const content = result?.markdown || '';

        if (!content) return '';

        return `${title}${description}${content}${sourceUrl}`;
    } catch (error) {
        console.error(error);
        return `No Result Found for ${url}`;
    }
};

const processContent = (content: string, maxLength: number = 10000): string => {
    if (!content) return '';

    const chunks = content.split('\n\n');
    let result = '';

    for (const chunk of chunks) {
        if ((result + chunk).length > maxLength) break;
        result += chunk + '\n\n';
    }

    return result.trim();
};

const fetchWithJina = async (url: string): Promise<TReaderResult> => {
    try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                Accept: 'application/json',
                'X-Engine': 'browser',
                // 'X-Md-Link-Style': 'referenced',
                'X-No-Cache': 'true',
                'X-Retain-Images': 'none',
                'X-Return-Format': 'markdown',
                'X-Robots-Txt': 'JinaReader',
                // 'X-With-Links-Summary': 'true',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`Jina API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data?.content) {
            return { success: false, error: 'No content found' };
        }

        return {
            success: true,
            title: data.data.title,
            description: data.data.description,
            url: data.data.url,
            markdown: processContent(data.data.content),
            source: 'jina',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const readURL = async (url: string): Promise<TReaderResult> => {
    try {
        if (process.env.JINA_API_KEY) {
            return await fetchWithJina(url);
        } else {
            console.log('No Jina API key found');
        }

        return { success: false };
    } catch (error) {
        console.error('Error in readURL:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export const processWebPages = async (
    results: Array<{ link: string; title: string }>,
    signal?: AbortSignal,
    options = { batchSize: 4, maxPages: 8, timeout: 30000 }
) => {
    const processedResults: Array<{ title: string; link: string; content: string }> = [];
    const timeoutSignal = AbortSignal.timeout(options.timeout);
    const combinedSignal = new AbortController();

    signal?.addEventListener('abort', () => combinedSignal.abort());
    timeoutSignal.addEventListener('abort', () => combinedSignal.abort());

    try {
        for (let i = 0; i < results.length; i += options.batchSize) {
            if (processedResults.length >= options.maxPages) break;

            const batch = results.slice(i, i + options.batchSize);
            const batchPromises = batch.map(result =>
                getWebPageContent(result.link)
                    .then(content => ({
                        title: result.title,
                        link: result.link,
                        content,
                    }))
                    .catch(() => null)
            );

            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter((r): r is NonNullable<typeof r> => r !== null);
            processedResults.push(...validResults);

            if (combinedSignal.signal.aborted) {
                break;
            }
        }

        return processedResults.slice(0, options.maxPages);
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            return processedResults.slice(0, options.maxPages);
        }
        throw error;
    }
};

export const executeWebSearch = async (queries: string[], signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new Error('Operation aborted');
    }

    const flatQueries = queries.flat();
    const results = await getSERPResults(flatQueries);
    const uniqueResults = results.filter(
        (result: { link: string }, index: number, self: { link: string }[]) =>
            index === self.findIndex((t: { link: string }) => t.link === result.link)
    );

    return uniqueResults;
};

export type TReaderResponse = {
    success: boolean;
    title: string;
    url: string;
    markdown: string;
    error?: string;
    source?: 'jina' | 'readability';
};

export type TReaderResult = {
    success: boolean;
    title?: string;
    url?: string;
    description?: string;
    markdown?: string;
    source?: 'jina' | 'readability';
    error?: string;
};

export const handleError = (error: Error, { context, events }: TaskParams) => {
    const errorMessage = generateErrorMessage(error);
    console.error('Task failed', error);

    events?.update('error', prev => ({
        ...prev,
        error: errorMessage,
        status: 'ERROR',
    }));

    return Promise.resolve({
        retry: false,
        result: 'error',
    });
};
