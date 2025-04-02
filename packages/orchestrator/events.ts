export type EventSchemaDefinition = Record<string, any>;

export class TypedEventEmitter<T extends EventSchemaDefinition> {
    private listeners: Map<keyof T, Set<(data: any) => void>> = new Map();
    private state: { [K in keyof T]?: T[K] } = {};

    constructor(initialState?: Partial<{ [K in keyof T]: T[K] }>) {
        if (initialState) {
            Object.entries(initialState).forEach(([key, value]) => {
                this.state[key as keyof T] = value;
            });
        }
    }

    on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
        return this;
    }

    onAll(cb: (event: keyof T, data: any) => void) {
        const allEventsCallback = (event: keyof T, data: any) => {
            cb(event, data);
        };

        for (const event of Object.keys(this.state) as Array<keyof T>) {
            this.on(event, data => allEventsCallback(event, data));
        }

        return this;
    }

    off<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
        this.listeners.get(event)?.delete(callback);
        return this;
    }

    emit<K extends keyof T>(event: K, data: T[K]) {
        this.state[event] = data;
        this.listeners.get(event)?.forEach(callback => {
            callback(data);
        });
        return this;
    }

    update<K extends keyof T>(event: K, updater: (current: T[K]) => T[K]) {
        const currentValue = this.state[event] as T[K];
        const newValue = updater(currentValue);
        this.emit(event, newValue);
        return this;
    }

    getState<K extends keyof T>(key: K): T[K] | undefined {
        return this.state[key];
    }

    getAllState(): { [K in keyof T]?: T[K] } {
        return { ...this.state };
    }
}

export function createTypedEventEmitter<T extends EventSchemaDefinition>(
    initialState?: Partial<{ [K in keyof T]: T[K] }>
) {
    return new TypedEventEmitter<T>(initialState);
}
