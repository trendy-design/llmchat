export type GraphEdgePatternType = 'revision' | 'parallel' | 'map' | 'reduce' | 'condition' | 'loop' | 'sequential';

export type BaseEdgeConfig = {
  fallbackNode?: string;
  priority?: number;
}

export type RevisionConfigType = BaseEdgeConfig & {
  maxIterations?: number;
  stopCondition?: string | ((response: string) => Promise<boolean> | boolean);
  revisionPrompt?: (prev: string) => string;
}

export type MapConfigType = BaseEdgeConfig & {
  inputTransform?: (input: string) => string[] | Promise<string[]>;
  outputTransform?: (outputs: string[]) => string | Promise<string>;
}

export type ReduceConfigType = BaseEdgeConfig & {
  outputTransform?: (inputs: string[]) => string | Promise<string>;
}

export type ConditionConfigType = BaseEdgeConfig & {
  condition: (input: string) => boolean | Promise<boolean>;
}

export type LoopConfigType = BaseEdgeConfig & {
  maxIterations?: number;
  stopCondition?: string | ((response: string) => Promise<boolean> | boolean);
  inputTransform?: (input: string) => string | Promise<string>;
  outputTransform?: (outputs: string[]) => string | Promise<string>;
}

export type SequentialConfigType = BaseEdgeConfig & {
  priority?: number;
}

export type EdgeConfigType<T extends GraphEdgePatternType> = 
  T extends 'revision' ? RevisionConfigType :
  T extends 'map' ? MapConfigType :
  T extends 'reduce' ? ReduceConfigType :
  T extends 'condition' ? ConditionConfigType :
  T extends 'loop' ? LoopConfigType :
  T extends 'sequential' ? SequentialConfigType :
  BaseEdgeConfig;

export type GraphEdgeType<T extends GraphEdgePatternType> = {
  from: string;
  to: string;
  pattern: T;
  config?: EdgeConfigType<T>;
}
