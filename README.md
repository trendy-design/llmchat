<p align="center">
  <img width="160" alt="LLMChat.co logo" src="https://github.com/user-attachments/assets/ea0535c8-37ee-4d5f-8db2-e15d5bc1decb">
</p>

<p align="center">
  <img width="1500" alt="LLMChat.co Interface" src="https://github.com/user-attachments/assets/d558b8f2-37ea-4a6d-b6ec-969d56cad103">
</p>

<p align="center">AI-powered chatbot with advanced research and agentic capabilities</p>

## 🚀 Overview

LLMChat.co is a sophisticated AI-powered chatbot platform that prioritizes privacy while offering powerful research and agentic capabilities. Built with a modern monorepo architecture, it provides multiple chat modes including Pro Search and Deep Research for in-depth analysis of complex topics.

## ✨ Key Features

- **Advanced Research Modes**:

    - 🔬 **Deep Research**: Comprehensive analysis of complex topics with in-depth exploration
    - 🔍 **Pro Search**: Enhanced search with web integration for real-time information

- **Multiple LLM Provider Support**:

    - OpenAI (GPT-4o, GPT-4o Mini, O3 Mini)
    - Anthropic (Claude 3.5 Sonnet, Claude 3.7 Sonnet)
    - Google (Gemini 2 Flash)
    - Fireworks (Llama 4 Scout, DeepSeek R1, QWQ 32B)
    - Together AI (DeepSeek R1 Distill Qwen 14B)

- **Privacy-Focused**:

    - 🔒 **Local Storage**: All user data stored in browser using IndexedDB via Dexie.js
    - 🛡️ **No Server-Side Storage**: Chat history never leaves your device

- **Agentic Capabilities**:

    - 🧠 **Workflow Orchestration**: Complex task coordination via custom workflow engine
    - 🔄 **Reflective Analysis**: Self-improvement through analysis of prior reasoning
    - 📊 **Structured Output**: Clean presentation of research findings

- **Enhanced User Experience**:
    - 📱 **Progressive Web App**: Install on any device for a native-like experience
    - 🔄 **Tab Synchronization**: Seamless experience across multiple browser tabs
    - 📤 **Data Portability**: Easy import/export of chat data

## 🏗️ Architecture

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

## 🔄 Workflow Orchestration

At the core of LLMChat.co is a powerful workflow orchestration system that enables complex agentic capabilities:

- **WorkflowEngine**: Manages the execution of research tasks, handling state and context
- **Task System**: Specialized tasks for search, analysis, and reflection
- **Event-Driven Architecture**: Reactive workflows that adapt to new information
- **Persistent State**: Workflow state is preserved throughout execution

## 💾 Local Storage

LLMChat.co prioritizes user privacy by storing all data locally:

- **Dexie.js**: Used for IndexedDB interaction with a simple and powerful API
- **Thread Database**: Structured storage of chat threads and messages
- **Tab Synchronization**: SharedWorker or localStorage fallback for multi-tab experience
- **No Server Persistence**: Your conversations never leave your browser

## 🛠️ Tech Stack

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

## 🚀 Getting Started

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the terms included in the repository.

![LLMChat.co Footer](https://github.com/user-attachments/assets/4813a6b5-3294-4056-88bb-c536a45c220c)
