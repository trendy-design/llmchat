import { NodeState } from './types';

export type GraphState = {
        nodes: Map<string, NodeState>;
        currentExecution: {
                startTime: number;
                nodeStates: Map<string, NodeState>;
                executionPath: string[];
                input: string;
        };
        executionHistory: {
                startTime: number;
                endTime: number;
                duration: number;
                nodeStates: Map<string, NodeState>;
                executionPath: string[];
                input: string;
                finalOutput?: string;
        }[];
};

export class GraphStateManager {
        private state: GraphState;
        private onStateUpdate: ((state: GraphState) => void) | undefined;
        private onNodeUpdate: ((nodeId: string, state: NodeState) => void) | undefined;

        constructor({ onStateUpdate, onNodeUpdate }: { onStateUpdate?: (state: GraphState) => void, onNodeUpdate?: (nodeId: string, state: NodeState) => void }) {
                this.state = {
                        nodes: new Map(),
                        currentExecution: {
                                startTime: 0,
                                nodeStates: new Map(),
                                executionPath: [],
                                input: '',
                        },
                        executionHistory: [],
                };
                this.onStateUpdate = onStateUpdate;
                this.onNodeUpdate = onNodeUpdate;
        }

        startExecution(message: string): void {
                this.state.currentExecution = {
                        startTime: Date.now(),
                        nodeStates: new Map(),
                        executionPath: [],
                        input: message,
                };
                this.onStateUpdate?.(this.state);
        }

        completeExecution(finalOutput?: string): void {
                const { startTime, executionPath, nodeStates } = this.state.currentExecution;
                const endTime = Date.now();

                this.state.executionHistory.push({
                        startTime,
                        endTime,
                        duration: endTime - startTime,
                        nodeStates: new Map(nodeStates),
                        executionPath: [...executionPath],
                        input: this.state.currentExecution.input,
                        finalOutput,
                });
                this.onStateUpdate?.(this.state);
        }

        saveNodeState(nodeId: string, state: NodeState): void {
                const existing = this.state.nodes.get(nodeId) || { ...state, status: 'pending' };
                const merged = { ...existing, ...state };
                this.state.nodes.set(nodeId, merged);
                this.state.currentExecution.nodeStates.set(nodeId, merged);
                this.onStateUpdate?.(this.state);
                this.onNodeUpdate?.(nodeId, merged);
        }

        addToExecutionPath(nodeId: string): void {
                this.state.currentExecution.executionPath.push(nodeId);
                this.onStateUpdate?.(this.state);
        }

        getNodeState(nodeId: string): NodeState | undefined {
                return this.state.nodes.get(nodeId);
        }

        getCurrentNodeState(nodeId: string): NodeState | undefined {
                return this.state.currentExecution.nodeStates.get(nodeId);
        }

        getExecutionHistory(): typeof this.state.executionHistory {
                return this.state.executionHistory;
        }

        getCurrentExecutionPath(): string[] {
                return this.state.currentExecution.executionPath;
        }

        getAllNodeStates(): NodeState[] {
                return Array.from(this.state.nodes.values());
        }
}