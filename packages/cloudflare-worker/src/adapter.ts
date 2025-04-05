import { DurableObjectState } from '@cloudflare/workers-types';
import {
    ContextSchemaDefinition,
    EventSchemaDefinition,
    WorkflowBuilder,
    WorkflowEngine,
} from '@repo/orchestrator';
import { CloudflareDurableObjectStorage } from './persistence';
import { WorkflowPersistenceLayer } from './workflowPersistence';

export class CloudflareWorkflowAdapter<
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
> {
    private durableObjectState: DurableObjectState;
    private persistence: WorkflowPersistenceLayer<TEvent, TContext>;

    constructor(durableObjectState: DurableObjectState) {
        this.durableObjectState = durableObjectState;
        const storage = new CloudflareDurableObjectStorage(durableObjectState);
        this.persistence = new WorkflowPersistenceLayer<TEvent, TContext>(storage);
    }

    async workflowExists(workflowId: string): Promise<boolean> {
        return await this.persistence.exists(workflowId);
    }

    async loadWorkflow(workflowId: string): Promise<any> {
        return await this.persistence.loadWorkflow(workflowId, () => null);
    }

    async saveWorkflowState(workflowId: string, data: any): Promise<void> {
        await this.persistence.saveWorkflow(workflowId, data);
    }

    async deleteWorkflow(workflowId: string): Promise<void> {
        await this.persistence.deleteWorkflow(workflowId);
    }

    async startWorkflow(
        workflowId: string,
        builderFactory: () => WorkflowBuilder<TEvent, TContext>,
        initialTask: string,
        initialData?: any
    ): Promise<WorkflowEngine<TEvent, TContext>> {
        // Check if workflow already exists
        const exists = await this.persistence.exists(workflowId);
        let workflow;

        if (exists) {
            // Load existing workflow
            workflow = await this.persistence.loadWorkflow(workflowId, builderFactory);

            // If the workflow exists but we're starting a new execution,
            // we need to add an alarming mechanism here to handle the
            // case where we might be overriding an in-progress workflow
            console.warn(`Resuming existing workflow: ${workflowId}`);
        } else {
            // Create new workflow
            const builder = builderFactory();
            workflow = builder.build();
        }

        // Start the workflow with the specified task
        try {
            await workflow.start(initialTask, initialData);

            // The workflow will execute and update its state
            // The persistence layer will save the state periodically
            return workflow;
        } catch (error) {
            // If an error occurs, save the current state
            await this.persistence.saveWorkflow(workflowId, workflow);
            throw error;
        }
    }
}
