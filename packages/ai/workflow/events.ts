import { z } from 'zod';

export type EventSchemaDefinition = Record<string, z.ZodType<any>>;

export class TypedEventEmitter<T extends EventSchemaDefinition> {
  private listeners: Map<keyof T, Set<(data: any) => void>> = new Map();
  private state: { [K in keyof T]?: z.infer<T[K]> } = {};
  private schemas: T;

  constructor(schemas: T, initialState?: Partial<{ [K in keyof T]: z.infer<T[K]> }>) {
    this.schemas = schemas;
    
    if (initialState) {
      Object.entries(initialState).forEach(([key, value]) => {
        const schema = this.schemas[key as keyof T];
        if (schema) {
          try {
            this.state[key as keyof T] = schema.parse(value);
          } catch (error) {
            console.error(`Invalid initial state for key "${key}":`, error);
          }
        }
      });
    }
  }

  on<K extends keyof T>(event: K, callback: (data: z.infer<T[K]>) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return this;
  }

  off<K extends keyof T>(event: K, callback: (data: z.infer<T[K]>) => void) {
    this.listeners.get(event)?.delete(callback);
    return this;
  }

  emit<K extends keyof T>(event: K, data: z.infer<T[K]>) {
    try {
      // Validate data against schema
      const validatedData = this.schemas[event].parse(data);
      this.state[event] = validatedData;
      
      this.listeners.get(event)?.forEach(callback => {
        callback(validatedData);
      });
    } catch (error) {
      console.error(`Invalid data for event "${String(event)}":`, error);
    }
    return this;
  }

  update<K extends keyof T>(
    event: K, 
    updater: (current: z.infer<T[K]>) => z.infer<T[K]>
  ) {
    // Get current value or create a default one if it doesn't exist
    const currentValue = this.state[event];
    
    // If currentValue is undefined, try to create a default value using the schema
    if (currentValue === undefined) {
      try {
        // Try to create an empty object that matches the schema
        const defaultValue = this.schemas[event].parse({});
        const newValue = updater(defaultValue);
        this.emit(event, newValue);
      } catch (error) {
        console.error(`Failed to create default value for event "${String(event)}":`, error);
      }
      return this;
    }
    
    // Normal update flow when currentValue exists
    const newValue = updater(currentValue);
    this.emit(event, newValue);
    return this;
  }

  getState<K extends keyof T>(key: K): z.infer<T[K]> | undefined {
    return this.state[key];
  }

  getAllState(): { [K in keyof T]?: z.infer<T[K]> } {
    return { ...this.state };
  }
}

export function createTypedEventEmitter<T extends EventSchemaDefinition>(
  schemas: T,
  initialState?: Partial<{ [K in keyof T]: z.infer<T[K]> }>
) {
  return new TypedEventEmitter(schemas, initialState);
} 