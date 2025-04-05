import { DurableObjectState } from '@cloudflare/workers-types';

export class CloudflareDurableObjectStorage {
    private durableObjectState: DurableObjectState;

    constructor(durableObjectState: DurableObjectState) {
        this.durableObjectState = durableObjectState;
    }

    async save(key: string, data: any): Promise<void> {
        await this.durableObjectState.storage.put(key, data);
    }

    async load(key: string): Promise<any | null> {
        return await this.durableObjectState.storage.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.durableObjectState.storage.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const value = await this.durableObjectState.storage.get(key);
        return value !== null && value !== undefined;
    }
}
