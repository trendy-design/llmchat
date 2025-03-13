import { generateObject as generateObjectAi, streamText } from "ai";
import { ZodSchema } from "zod";
import { ModelEnum } from "../models";
import { getLanguageModel } from "../providers";

export const generateText = async ({ prompt, model, onChunk }: { prompt: string, model: ModelEnum, onChunk?: (chunk: string) => void }) => {
        try {
                const selectedModel = getLanguageModel(model);
                const { fullStream } = streamText({ prompt, model: selectedModel });
                let fullText = ""
                for await (const chunk of fullStream) {
                        if (chunk.type === 'text-delta') {
                                fullText += chunk.textDelta;
                                onChunk?.(fullText);
                        }
                }
                return Promise.resolve(fullText)
        } catch (error) {
                console.error(error);
                return Promise.reject(error);
        }
}

export const generateObject = async ({ prompt, model, schema }: { prompt: string, model: ModelEnum, schema: ZodSchema }) => {
        try {
                const selectedModel = getLanguageModel(model);
                const { object } = await generateObjectAi({ prompt, model: selectedModel, schema });
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