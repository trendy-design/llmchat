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

LLMChat.co's core engine is a sophisticated workflow orchestration system that enables complex agentic capabilities. The system coordinates multiple specialized tasks to deliver comprehensive research and analysis.

### Key Components

- **WorkflowEngine**: Manages execution state and coordinates task flow
- **Task System**: Specialized tasks for different aspects of research and analysis
- **Event-Driven Architecture**: Reactive system that emits and responds to state changes
- **Context Management**: Maintains conversation and research context throughout execution

### Research Workflow Example

Here's how you can use the workflow engine to create a research agent:

```typescript
import { Langfuse } from 'langfuse';
import {
    createContext,
    createTypedEventEmitter,
    WorkflowBuilder,
    WorkflowConfig,
} from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import {
    webSearchTask,
    reflectorTask,
    analysisTask,
    writerTask,
    plannerTask,
} from '@repo/ai/workflow/tasks';

// Create a research workflow
function createResearchWorkflow({ question, threadId, messages, onFinish }) {
    // Initialize tracing for monitoring
    const trace = new Langfuse().trace({
        name: 'deep-research-workflow',
    });

    // Configure workflow parameters
    const workflowConfig: WorkflowConfig = {
        maxIterations: 2,
        timeoutMs: 480000,
        retryDelayMs: 1000,
    };

    // Set up event system for real-time updates
    const events = createTypedEventEmitter({
        steps: {},
        answer: { status: 'PENDING' },
        sources: [],
        status: 'PENDING',
    });

    // Create context to share data between tasks
    const context = createContext({
        question,
        mode: ChatMode.Deep,
        messages,
        queries: [],
        sources: [],
        summaries: [],
        threadId,
        onFinish,
    });

    // Build the workflow with necessary tasks
    return new WorkflowBuilder(threadId, {
        trace,
        events,
        context,
        config: workflowConfig,
    })
        .task(plannerTask) // Plan the research approach
        .task(webSearchTask) // Search the web for information
        .task(reflectorTask) // Analyze and reflect on findings
        .task(analysisTask) // Synthesize research results
        .task(writerTask) // Generate final comprehensive response
        .build();
}

// Execute the workflow
const workflow = createResearchWorkflow({
    question: 'What are the latest developments in quantum computing?',
    threadId: 'thread-123',
    messages: [],
    onFinish: result => console.log('Research complete:', result),
});

// Start the workflow from the planning stage
await workflow.start('planner');
```

The workflow processes through these stages:

1. **Planning**: Breaks down complex questions into research steps
2. **Web Search**: Gathers relevant information from the internet
3. **Reflection**: Analyzes information gaps and determines if more search is needed
4. **Analysis**: Synthesizes findings into a coherent understanding
5. **Writing**: Produces a comprehensive, well-structured response

Each step emits events that update the UI in real-time, allowing users to see the research process unfold.

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
