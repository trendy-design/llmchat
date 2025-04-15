<div align="center" id="top">
  <a href="https://llmchat.co">
    <img width="160" alt="LLMChat.co logo" src="https://github.com/user-attachments/assets/ea0535c8-37ee-4d5f-8db2-e15d5bc1decb">
  </a>
</div>

<div align="center">
  <a href="https://llmchat.co/docs">📚 Documentation</a> &nbsp;|&nbsp;
  <a href="https://llmchat.co/examples">💡 Examples</a> &nbsp;|&nbsp;
  <a href="https://github.com/your-repo/llmchat/stargazers">🌟 Star Us</a>
</div>

## Introduction

[LLMChat.co](https://llmchat.co) is a sophisticated AI-powered chatbot platform that prioritizes privacy while offering powerful research and agentic capabilities. Built as a monorepo with Next.js, TypeScript, and cutting-edge AI technologies, it provides multiple specialized chat modes including Pro Search and Deep Research for in-depth analysis of complex topics.

LLMChat.co stands out with its workflow orchestration system and focus on privacy, storing all user data locally in the browser using IndexedDB, ensuring your conversations never leave your device.

## Key Features

**Advanced Research Modes**

- **Deep Research**: Comprehensive analysis of complex topics with in-depth exploration
- **Pro Search**: Enhanced search with web integration for real-time information

**Multiple LLM Provider Support**

- OpenAI (GPT-4o, GPT-4o Mini, O3 Mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3.7 Sonnet)
- Google (Gemini 2 Flash)
- Fireworks (Llama 4 Scout, DeepSeek R1, QWQ 32B)
- Together AI (DeepSeek R1 Distill Qwen 14B)

**Privacy-Focused**

- **Local Storage**: All user data stored in browser using IndexedDB via Dexie.js
- **No Server-Side Storage**: Chat history never leaves your device

**Agentic Capabilities**

- **Workflow Orchestration**: Complex task coordination via custom workflow engine
- **Reflective Analysis**: Self-improvement through analysis of prior reasoning
- **Structured Output**: Clean presentation of research findings

**Enhanced User Experience**

- **Progressive Web App**: Install on any device for a native-like experience
- **Tab Synchronization**: Seamless experience across multiple browser tabs
- **Data Portability**: Easy import/export of chat data

## Architecture

LLMChat.co is built as a monorepo with a clear separation of concerns:

```
├── apps/
│   ├── web/         # Next.js web application
│   └── desktop/     # Desktop application
│
└── packages/
    ├── ai/          # AI models and workflow orchestration
    ├── actions/     # Shared actions and API handlers
    ├── common/      # Common utilities and hooks
    ├── orchestrator/# Workflow engine and task management
    ├── prisma/      # Database schema and client
    ├── shared/      # Shared types and constants
    ├── ui/          # Reusable UI components
    ├── tailwind-config/ # Shared Tailwind configuration
    └── typescript-config/ # Shared TypeScript configuration
```

## Workflow Orchestration

LLMChat.co's workflow orchestration enables powerful agentic capabilities through a modular, step-by-step approach. Here's how to create a research agent:

### 1. Define Event and Context Types

First, establish the data structure for events and context:

```typescript
// Define the events emitted by each task
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

// Define the shared context between tasks
type AgentContext = {
    query: string;
    tasks: string[];
    searchResults: string[];
    analysis: string;
    insights: string[];
    report: string;
};
```

### 2. Initialize Core Components

Next, set up the event emitter, context, and workflow builder:

```typescript
import { OpenAI } from 'openai';
import { createTask } from 'task';
import { WorkflowBuilder } from './builder';
import { Context } from './context';
import { TypedEventEmitter } from './events';

// Initialize event emitter with proper typing
const events = new TypedEventEmitter<AgentEvents>();

// Create the workflow builder with proper context
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
```

### 3. Define Research Tasks

Create specialized tasks for each step of the research process:

#### Planning Task

```typescript
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
```

#### Information Gathering Task

```typescript
// Information Gatherer: Searches for information based on tasks
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
```

#### Analysis Task

```typescript
// Information Analyzer: Analyzes gathered information for insights
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
```

#### Report Generation Task

```typescript
// Report Generator: Creates a comprehensive report
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
```

### 4. Build and Execute the Workflow

Finally, assemble and run the workflow:

```typescript
// Add all tasks to the workflow
builder.addTask(taskPlanner);
builder.addTask(informationGatherer);
builder.addTask(informationAnalyzer);
builder.addTask(reportGenerator);

// Build the workflow
const workflow = builder.build();

// Start the workflow with an initial query
workflow.start('taskPlanner', { query: 'Research the impact of AI on healthcare' });

// Export the workflow for external use
export const researchAgent = workflow;
```

The workflow processes through these stages:

1. **Planning**: Breaks down complex questions into specific research tasks
2. **Information Gathering**: Collects relevant data for each task
3. **Analysis**: Synthesizes information and identifies key insights
4. **Report Generation**: Produces a comprehensive, structured response

Each step emits events that can update the UI in real-time, allowing users to see the research process unfold.

## Local Storage

LLMChat.co prioritizes user privacy by storing all data locally:

- **Dexie.js**: Used for IndexedDB interaction with a simple and powerful API
- **Thread Database**: Structured storage of chat threads and messages
- **Tab Synchronization**: SharedWorker or localStorage fallback for multi-tab experience
- **No Server Persistence**: Your conversations never leave your browser

## Tech Stack

### Frontend

- **Next.js 14**: React framework with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Shadcn UI**: Component library
- **Tiptap**: Rich text editor
- **Zustand**: State management

### AI & Machine Learning

- **AI SDK**: Unified interface for multiple AI providers
- **LangChain**: Tools for building LLM applications
- **Workflow Engine**: Custom workflow orchestration system
- **In-browser Vector Storage**: Local vector embeddings

### Storage & Data

- **Dexie.js**: IndexedDB wrapper
- **PGLite**: Embedded PostgreSQL for local data
- **Electric SQL**: Local-first database sync

### Development

- **Turborepo**: Monorepo management
- **Bun**: JavaScript runtime and package manager
- **ESLint & Prettier**: Code quality tools
- **Husky**: Git hooks

## Getting Started

### Prerequisites

- Ensure you have `bun` installed (recommended) or `yarn`

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/llmchat.git
cd llmchat
```

2. Install dependencies:

```bash
bun install
# or
yarn install
```

3. Start the development server:

```bash
bun dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Documentation & Examples

- [Full Documentation](https://llmchat.co/docs)
- [Usage Examples](https://llmchat.co/examples)
- [API Reference](https://llmchat.co/docs/api)

## Contributing

We welcome contributions! Please read our [contributing guidelines](https://github.com/your-repo/llmchat/blob/main/CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the terms included in the repository.

<p align="left">
  <a href="#top">⬆️ Back to Top</a>
</p>
