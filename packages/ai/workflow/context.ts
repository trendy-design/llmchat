import { z } from 'zod';

export type ContextSchemaDefinition = Record<string, z.ZodType<any>>;

export class Context<T extends ContextSchemaDefinition> {
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

  get<K extends keyof T>(key: K): z.infer<T[K]> | undefined {
    return this.state[key];
  }

  getAll(): { [K in keyof T]?: z.infer<T[K]> } {
    return { ...this.state };
  }

  set<K extends keyof T>(key: K, value: z.infer<T[K]>): void {
    try {
      // Validate against schema
      const validatedValue = this.schemas[key].parse(value);
      this.state[key] = validatedValue;
    } catch (error) {
      console.error(`Invalid value for key "${String(key)}":`, error);
    }
  }

  update<K extends keyof T>(
    key: K, 
    updater: (current: z.infer<T[K]> | undefined) => z.infer<T[K]>
  ): void {
    const currentValue = this.state[key];
    const newValue = updater(currentValue);
    
    this.set(key, newValue);
  }

  // Helper method to merge multiple updates at once
  merge(updates: Partial<{ [K in keyof T]: z.infer<T[K]> }>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key as keyof T, value);
    });
  }
}

export function createContext<T extends ContextSchemaDefinition>(
  schemas: T,
  initialState?: Partial<{ [K in keyof T]: z.infer<T[K]> }>
) {
  return new Context<T>(schemas, initialState);
} 