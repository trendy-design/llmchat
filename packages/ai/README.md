# Agentic Graph System

A flexible and powerful system for building AI agent workflows using a graph-based architecture.

## Features

- Graph-based workflow management
- Multiple specialized node types:
  - Executor Node: For task execution
  - Router Node: For intelligent routing
  - Memory Node: For state management
  - Observer Node: For monitoring and analysis
- Event-driven architecture
- Support for multiple LLM providers:
  - OpenAI
  - Anthropic
  - Together AI

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your API keys and preferences in `.env.local`

3. Run the customer support example:
   ```bash
   ts-node examples/customer-support-workflow.ts
   ```

## Example Usage

The customer support workflow example demonstrates how to:

1. Create a workflow with specialized nodes
2. Set up routing logic
3. Store interaction history
4. Monitor and analyze system behavior

```typescript
import { handleCustomerSupport } from './examples/customer-support-workflow';

// Handle a customer inquiry
const inquiry = "I can't log into my account";
const result = await handleCustomerSupport(inquiry);
console.log(result);
```

## Node Types

### Executor Node

- Handles specific tasks
- Processes input and generates responses
- Can be specialized for different roles

### Router Node

- Analyzes input and routes to appropriate nodes
- Uses confidence scoring
- Supports multiple routing strategies

### Memory Node

- Stores interaction history
- Manages short-term and long-term memory
- Provides context for decision-making

### Observer Node

- Monitors system behavior
- Analyzes patterns and performance
- Generates insights and recommendations

## Event System

The system provides comprehensive event handling:

- `workflow.started`
- `workflow.completed`
- `workflow.error`
- `node.processing`
- `node.processed`
- `node.error`
- And more...

## Configuration

Environment variables (see `.env.example`):

- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (default: gpt-4)
- `ANTHROPIC_API_KEY` (optional)
- `ANTHROPIC_MODEL` (optional)
- `TOGETHER_API_KEY` (optional)
- `TOGETHER_MODEL` (optional)
- `TEMPERATURE` (default: 0.7)
- `MAX_TOKENS` (default: 4000)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
