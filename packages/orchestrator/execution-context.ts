import { EventEmitter } from 'events';
import { TaskTiming, WorkflowState } from './types';

export class ExecutionContext {
    private state: WorkflowState;
    private aborted: boolean;
    private gracefulShutdown: boolean;
    private taskExecutionCounts: Map<string, number>;
    private eventEmitter: EventEmitter;

    private taskTimings: Map<string, TaskTiming[]>;

    constructor(eventEmitter: EventEmitter) {
        this.state = {
            completedTasks: new Set(),
            runningTasks: new Set(),
            taskData: new Map(),
        };
        this.aborted = false;
        this.gracefulShutdown = false;
        this.taskExecutionCounts = new Map();
        this.eventEmitter = eventEmitter;
        this.taskTimings = new Map();
    }

    setState(func: (state: WorkflowState) => WorkflowState) {
        this.state = func(this.state);
    }

    markTaskComplete(taskName: string, data: any) {
        if (this.aborted && !this.gracefulShutdown) return;

        // Track execution count for this task
        const currentCount = this.taskExecutionCounts.get(taskName) || 0;
        const newCount = currentCount + 1;
        this.taskExecutionCounts.set(taskName, newCount);

        // Emit an event with the updated execution count
        this.emitTaskExecutionEvent(taskName, newCount);

        this.state.completedTasks.add(taskName);
        this.state.runningTasks.delete(taskName);
        this.state.taskData.set(taskName, data);
    }

    resetTaskCompletion(taskName: string) {
        this.state.completedTasks.delete(taskName);
    }

    getTaskExecutionCount(taskName: string): number {
        return this.taskExecutionCounts.get(taskName) || 0;
    }

    isTaskComplete(taskName: string) {
        return this.state.completedTasks.has(taskName);
    }

    isTaskRunning(taskName: string) {
        return this.state.runningTasks.has(taskName);
    }

    getTaskData(taskName: string) {
        return this.state.taskData.get(taskName);
    }

    abortWorkflow(graceful: boolean = false) {
        console.log(
            graceful ? '🟡 Gracefully stopping workflow...' : '🚨 Workflow aborted immediately!'
        );
        this.aborted = true;
        this.gracefulShutdown = graceful;
    }

    isAborted() {
        return this.aborted;
    }

    isGracefulShutdown() {
        return this.gracefulShutdown;
    }

    getAllTaskRunCounts(): Record<string, number> {
        const counts: Record<string, number> = {};
        this.taskExecutionCounts.forEach((count, name) => {
            counts[name] = count;
        });
        return counts;
    }

    emitTaskExecutionEvent(taskName: string, count: number): void {
        if (this.eventEmitter) {
            this.eventEmitter.emit('taskExecution', { taskName, count });
        }
    }

    hasReachedMaxRuns(taskName: string, maxRuns: number): boolean {
        const count = this.getTaskExecutionCount(taskName);
        return count >= maxRuns;
    }

    startTaskTiming(taskName: string) {
        const timing: TaskTiming = {
            startTime: Date.now(),
            status: 'success',
        };

        if (!this.taskTimings.has(taskName)) {
            this.taskTimings.set(taskName, []);
        }
        this.taskTimings.get(taskName)!.push(timing);
    }

    endTaskTiming(taskName: string, error?: Error) {
        const timings = this.taskTimings.get(taskName);
        if (timings && timings.length > 0) {
            const currentTiming = timings[timings.length - 1];
            currentTiming.endTime = Date.now();
            currentTiming.duration = currentTiming.endTime - currentTiming.startTime;
            if (error) {
                currentTiming.status = 'failed';
                currentTiming.error = error;
            }
        }
    }

    getTaskTimingSummary(): Record<
        string,
        {
            totalDuration: string;
            attempts: number;
            failures: number;
            averageDuration: string;
        }
    > {
        const summary: Record<string, any> = {};

        const formatDuration = (ms: number): string => {
            if (ms < 1000) return `${ms}ms`;
            if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
            return `${(ms / 60000).toFixed(1)}m`;
        };

        this.taskTimings.forEach((timings, taskName) => {
            const failures = timings.filter(t => t.status === 'failed').length;
            const completedTimings = timings.filter(t => t.duration !== undefined);
            const totalDuration = completedTimings.reduce((sum, t) => sum + (t.duration ?? 0), 0);
            const validAttempts = completedTimings.length;

            summary[taskName] = {
                totalDuration: formatDuration(totalDuration),
                attempts: timings.length,
                failures,
                averageDuration: formatDuration(
                    validAttempts > 0 ? totalDuration / validAttempts : 0
                ),
            };
        });

        return summary;
    }

    parseDurationToMs(duration: string): number {
        const [value, unit] = duration.split(' ');
        const multiplier = unit === 'ms' ? 1 : unit === 's' ? 1000 : 60000;
        return parseFloat(value) * multiplier;
    }

    getMainTimingSummary(): {
        totalRuns: number;
        totalFailures: number;
        totalDuration: string;
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        averageTaskDuration: string;
        slowestTask: string;
        highestFailureTask: string;
        status: 'success' | 'failed';
    } {
        const taskSummary = this.getTaskTimingSummary();
        let totalRuns = 0;
        let totalFailures = 0;
        let totalDurationMs = 0;
        let totalTasks = Object.keys(taskSummary).length;
        let failedTasks = 0;
        let slowestTask = { name: '', duration: 0 };
        let highestFailureTask = { name: '', failures: 0 };

        Object.entries(taskSummary).forEach(([taskName, stats]) => {
            totalRuns += stats.attempts;
            totalFailures += stats.failures;

            // Parse the duration strings back to milliseconds
            const durationMs = this.parseDurationToMs(stats.totalDuration);
            totalDurationMs += durationMs;

            if (stats.failures > 0) {
                failedTasks++;
            }

            if (durationMs > slowestTask.duration) {
                slowestTask = { name: taskName, duration: durationMs };
            }

            if (stats.failures > highestFailureTask.failures) {
                highestFailureTask = { name: taskName, failures: stats.failures };
            }
        });

        const formatDuration = (ms: number): string => {
            if (ms < 1000) return `${ms}ms`;
            if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
            return `${(ms / 60000).toFixed(1)}m`;
        };

        return {
            totalRuns,
            totalFailures,
            totalDuration: formatDuration(totalDurationMs),
            totalTasks,
            completedTasks: totalTasks - failedTasks,
            failedTasks,
            averageTaskDuration: formatDuration(totalTasks > 0 ? totalDurationMs / totalTasks : 0),
            slowestTask: slowestTask.name,
            highestFailureTask: highestFailureTask.name,
            status: this.isAborted() || failedTasks > 0 ? 'failed' : 'success',
        };
    }
}
