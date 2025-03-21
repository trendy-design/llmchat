import { CoreMessage, extractReasoningMiddleware, generateObject as generateObjectAi, streamText, ToolSet } from "ai";
import { format } from "date-fns";
import { ZodSchema } from "zod";
import { ModelEnum } from "../models";
import { getLanguageModel } from "../providers";

export const generateText = async ({ prompt, model, onChunk, messages, onReasoning, tools, onToolCall, onToolResult }: { prompt: string, model: ModelEnum, onChunk?: (chunk: string) => void, messages?: CoreMessage[], onReasoning?: (chunk: string) => void, tools?: ToolSet, onToolCall?: (toolCall: any) => void, onToolResult?: (toolResult: any) => void  }) => {
        try {

                const middleware = extractReasoningMiddleware({
                        tagName: 'think',
                        separator: '\n',
                });


                const selectedModel = getLanguageModel(model, middleware);
                const { fullStream } = !!messages?.length ? streamText({ system: prompt, model: selectedModel, messages, tools, maxSteps: 10, toolChoice:"auto" }) : streamText({ prompt, model: selectedModel, tools, maxSteps: 10, toolChoice:"auto" });
                let fullText = ""
                let reasoning = ""
                const toolCallsMap: Record<string, any> = {};
                const toolResultsMap: Record<string, any> = {};  
                for await (const chunk of fullStream) {

                        if (chunk.type === 'text-delta') {
                                fullText += chunk.textDelta;
                                onChunk?.(fullText);
                        }
                        if (chunk.type === "reasoning") {
                                reasoning += chunk.textDelta;
                                onReasoning?.(reasoning);
                        }
                        if (chunk.type === 'tool-call') {
                                console.log("tool-call", chunk);
                                toolCallsMap[chunk.toolCallId] = chunk;
                                onToolCall?.(toolCallsMap);
                        }
                        if (chunk.type === 'tool-result' as any) {
                                console.log("tool-result", chunk);
                                const toolResult = chunk as any;
                                toolResultsMap[toolResult.toolCallId] = toolResult;
                                onToolResult?.(toolResultsMap);
                        }

                        if (chunk.type === "error") {
                                console.error(chunk.error);
                                return Promise.reject(chunk.error);
                        }
                }
                return Promise.resolve(fullText)
        } catch (error) {
                console.error(error);
                return Promise.reject(error);
        }
}

export const generateObject = async ({ prompt, model, schema, messages }: { prompt: string, model: ModelEnum, schema: ZodSchema, messages?: CoreMessage[] }) => {
        try {
                const selectedModel = getLanguageModel(model);
                const { object } = !!messages?.length ? await generateObjectAi({ system: prompt, model: selectedModel, schema, messages }) : await generateObjectAi({ prompt, model: selectedModel, schema });
                console.log("object",object);
                return JSON.parse(JSON.stringify(object));
        } catch (error) {
                console.error(error);
                return null;
        }
}

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
                update: <K extends keyof T>(key: K, value: T[K] | ((current: T[K] | undefined) => T[K])) => {
                        const updater = typeof value === 'function'
                                ? value as (current: T[K] | undefined) => T[K]
                                : () => value;

                        emitter.updateState(key, updater);
                        emitter.emit('stateChange', { key, value: emitter.getState()[key] });
                        return emitter.getState();
                }
        };
}

export const getHumanizedDate = () => {
        return format(new Date(), "MMMM dd, yyyy, h:mm a");
}

export const getSERPResults = async (queries: string[]) => {
        const myHeaders = new Headers();
        myHeaders.append('X-API-KEY', process.env.SERPER_API_KEY || (self as any).SERPER_API_KEY || '');
        myHeaders.append('Content-Type', 'application/json');

        const raw = JSON.stringify(
                queries.map(query => ({
                        q: query,
                }))
        );

        const requestOptions = {
                method: 'POST' as const,
                headers: myHeaders,
                body: raw,
                redirect: 'follow' as const,
        };
        try {
                const response = await fetch('https://google.serper.dev/search', requestOptions);
                const batchResult = await response.json();

                // Map each query's organic results, flatten into a single array, then remove duplicates based on the 'link'.
                const organicResultsLists = batchResult?.map((result: any) => result.organic?.slice(0, 10)) || [];
                const allOrganicResults = organicResultsLists.flat();
                const uniqueOrganicResults = allOrganicResults.filter(
                        (result: any, index: number, self: any[]) =>
                                index === self.findIndex((r: any) => r?.link === result?.link)
                );

                return uniqueOrganicResults.slice(0, 10).map((item: any) => ({ title: item.title, link: item.link, snippet: item.snippet }));
        } catch (error) {
                console.error(error);
        }
};

export const getWebPageContent = async (url: string) => {
        try {

                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reader`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url }),
                });
                const result = await response.json();
                const title = result?.result?.title ? `# ${result.result.title}\n\n` : '';
                const description = result?.result?.description ? `${result.result.description}\n\n ${result.result.content}\n\n` : '';
                const sourceUrl = result?.result?.url
                        ? `Source: [${result.result.url}](${result.result.url})\n\n`
                        : '';
                const content = result?.result?.markdown || result?.result?.content || '';

                if (!content) return '';

                return `${title}${description}${content}${sourceUrl}`;
        } catch (error) {
                console.error(error);
                return `No Result Found for ${url}`;
        }
};

export const executeWebSearch = async (queries: string[],) => {
        const webSearchResults = await Promise.all(queries.map(async (query) => {
                const result = await getSERPResults([query]);
                return result.slice(0, 10);
        }));

        const uniqueWebSearchResults = webSearchResults.flat().filter((result, index, self) =>
                index === self.findIndex((t) => t.link === result.link)
        )


        const webPageContents = await Promise.all(uniqueWebSearchResults.map(async (result) => {
                const content = await getWebPageContent(result.link);

                return {
                        title: result.title,
                        link: result.link,

                        content,
                };
        }));

        return webPageContents?.filter((item) => !!item.content).slice(0, 10);
}
