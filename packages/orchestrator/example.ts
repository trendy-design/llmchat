import { OpenAI } from 'openai';
import { WorkflowBuilder } from './builder';
import { Context } from './context';
import { TypedEventEmitter } from './events';
import { createTask } from './task';

// Define specific event types
type AgentEvents = {
    taskPlanner: {
        tasks: string[];
        query: string;
    };
    informationGatherer: {
        searchResults: string[];
    };
    informationAnalyzer: {
        analysis: string;
        insights: string[];
    };
    reportGenerator: {
        report: string;
    };
};

// Define the context shape with proper typing
type AgentContext = {
    query: string;
    tasks: string[];
    searchResults: string[];
    analysis: string;
    insights: string[];
    report: string;
};

// Initialize event emitter with proper typing
const events = new TypedEventEmitter<AgentEvents>();

// Initialize workflow builder with proper context
const builder = new WorkflowBuilder<AgentEvents, AgentContext>('research-agent', {
    events,
    context: new Context<AgentContext>({
        query: '',
        tasks: [],
        searchResults: [],
        analysis: '',
        insights: [],
        report: '',
    }),
});

// Initialize LLM client
const llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Task Planner: Breaks down a research query into specific tasks
const taskPlanner = createTask({
    name: 'taskPlanner',
    execute: async ({ context, data }) => {
        const userQuery = data?.query || 'Research the impact of AI on healthcare';

        const planResponse = await llm.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a task planning assistant that breaks down research queries into specific search tasks.',
                },
                {
                    role: 'user',
                    content: `Break down this research query into specific search tasks: "${userQuery}". Return a JSON array of tasks.`,
                },
            ],
            response_format: { type: 'json_object' },
        });

        const content = planResponse.choices[0].message.content || '{"tasks": []}';
        const parsedContent = JSON.parse(content);
        const tasks = parsedContent.tasks || [];

        context?.set('query', userQuery);
        context?.set('tasks', tasks);

        return {
            tasks,
            query: userQuery,
        };
    },
    route: () => 'informationGatherer',
});

// Information Gatherer: Simulates searching for information based on tasks
const informationGatherer = createTask({
    name: 'informationGatherer',
    dependencies: ['taskPlanner'],
    execute: async ({ context, data }) => {
        const tasks = data.taskPlanner.tasks;
        const searchResults: string[] = [];

        // Process each task to gather information
        for (const task of tasks) {
            const searchResponse = await llm.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a search engine that returns factual information.',
                    },
                    {
                        role: 'user',
                        content: `Search for information about: ${task}. Return relevant facts and data.`,
                    },
                ],
            });

            const result = searchResponse.choices[0].message.content || '';
            if (result) {
                searchResults.push(result);
            }
        }

        context?.set('searchResults', searchResults);

        return {
            searchResults,
        };
    },
    route: () => 'informationAnalyzer',
});

// Information Analyzer: Analyzes the gathered information to extract insights
const informationAnalyzer = createTask({
    name: 'informationAnalyzer',
    dependencies: ['informationGatherer'],
    execute: async ({ context, data }) => {
        const searchResults = data.informationGatherer.searchResults;
        const query = context?.get('query') || '';

        const analysisResponse = await llm.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an analytical assistant that identifies patterns and extracts insights from information.',
                },
                {
                    role: 'user',
                    content: `Analyze the following information regarding "${query}" and provide a coherent analysis with key insights:\n\n${searchResults.join('\n\n')}`,
                },
            ],
            response_format: { type: 'json_object' },
        });

        const content =
            analysisResponse.choices[0].message.content || '{"analysis": "", "insights": []}';
        const parsedContent = JSON.parse(content);
        const analysis = parsedContent.analysis || '';
        const insights = parsedContent.insights || [];

        context?.set('analysis', analysis);
        context?.set('insights', insights);

        return {
            analysis,
            insights,
        };
    },
    route: () => 'reportGenerator',
});

// Report Generator: Creates a comprehensive report based on the analysis
const reportGenerator = createTask({
    name: 'reportGenerator',
    dependencies: ['informationAnalyzer'],
    execute: async ({ context, data }) => {
        const { analysis, insights } = data.informationAnalyzer;
        const { query, searchResults } = context?.getAll() || { query: '', searchResults: [] };

        const reportResponse = await llm.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a report writing assistant that creates comprehensive, well-structured reports.',
                },
                {
                    role: 'user',
                    content: `Create a comprehensive report on "${query}" using the following analysis and insights.\n\nAnalysis: ${analysis}\n\nInsights: ${insights.join('\n- ')}\n\nStructure the report with an executive summary, key findings, detailed analysis, and conclusions.`,
                },
            ],
        });

        const report = reportResponse.choices[0].message.content || '';

        context?.set('report', report);

        return {
            report,
        };
    },
    route: () => 'end',
});

// Add all tasks to the workflow
builder.addTask(taskPlanner);
builder.addTask(informationGatherer);
builder.addTask(informationAnalyzer);
builder.addTask(reportGenerator);

// Build and start the workflow
const workflow = builder.build();
workflow.start('taskPlanner', { query: 'Research the impact of AI on healthcare' });

// Export the workflow for external use
export const researchAgent = workflow;
