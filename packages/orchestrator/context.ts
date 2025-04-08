export type ContextSchemaDefinition = Record<string, any>;

export class Context<T extends ContextSchemaDefinition> {
  private state: { [K in keyof T]?: T[K] } = {};

  constructor(initialState?: Partial<{ [K in keyof T]: T[K] }>) {
    if (initialState) {
      Object.entries(initialState).forEach(([key, value]) => {
        this.state[key as keyof T] = value;
      });
    }
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.state[key];
  }

  getAll(): { [K in keyof T]?: T[K] } {
    return { ...this.state };
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.state[key] = value;
  }

  update<K extends keyof T>(
    key: K, 
    updater: (current: T[K] | undefined) => T[K]
  ): void {
    const currentValue = this.state[key];
    const newValue = updater(currentValue);
    this.set(key, newValue);
  }

  merge(updates: Partial<{ [K in keyof T]: T[K] }>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key as keyof T, value);
    });
  }
}

export function createContext<T extends ContextSchemaDefinition>(
  initialState?: Partial<{ [K in keyof T]: T[K] }>
) {
  return new Context<T>(initialState);
} 