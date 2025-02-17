import { Tool, tool } from 'ai';
import { z } from 'zod';

export const getSERPResults = async (query: string) => {
  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", process.env.SERPER_API_KEY || '');
  myHeaders.append("Content-Type", "application/json");
  
  const raw = JSON.stringify({
    "q": query
  });
  
  const requestOptions = {
    method: "POST" as const,
    headers: myHeaders,
    body: raw,
    redirect: "follow" as const
  };
  try {
    const response = await fetch("https://google.serper.dev/search", requestOptions);
    const result = await response.json();
    return result?.organic?.map((item: any) => item);
  } catch (error) {
    console.error(error);
  };
}

const getWebPageContent = async (url: string) => {
  const response = await fetch("http://localhost:3001/api/reader", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });
  const result = await response.json();
  const title = result?.result?.title ? `# ${result.result.title}\n\n` : '';
  const description = result?.result?.description ? `${result.result.description}\n\n` : '';
  const sourceUrl = result?.result?.url ? `Source: [${result.result.url}](${result.result.url})\n\n` : '';
  const content = result?.result?.markdown || result?.result?.content || '';

  if (!content) return '';

  return `${title}${description}${content}${sourceUrl}`;
}

export const searchTool = tool({
  description: 'Search the web for information',
  parameters: z.object({
    reasoning: z.string().describe('The reasoning for the search'),
    query: z.string().min(1).describe('The query to search the web for'),
  }),
  type:"function",
  execute: async ({ query, reasoning }) => {

    const results = await getSERPResults(query);

    return results;
  },
});


export const readerTool = tool({
  description: 'Read the web page information from the given url',
  parameters: z.object({
    url: z.string().describe('The url to read the web page information from'),
    reasoning: z.string().describe('The reasoning for the reading'),
  }),
  type:"function",
  execute: async ({ url }) => {
    const result = await getWebPageContent(url);
    return result;
  },
});

export const calculatorTool = tool({
  description: 'Perform basic mathematical calculations',
  parameters: z.object({
    operation: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The mathematical operation'),
  }),
  type:"function",
  execute: async ({ operation }) => {
    return { result: `Performed ${operation}` };
  },
});

export const weatherTool = tool({
  description: 'Get weather information for a location',
  parameters: z.object({
    location: z.string().min(1).describe('The location to get the weather for'),
  }),
  type:"function",
  execute: async ({ location }) => {
    const temperature = 72 + Math.floor(Math.random() * 21) - 10;
    return { location, temperature };
  },
});

export const plannerTool = tool({
  description: 'You are a careful, step‐by‐step research assistant. For any question the user asks, you will first create a brief workflow or outline of how you intend to investigate the question.',
  parameters: z.object({
    questions: z.array(z.string()).describe('The questions to plan a task for'),
  }),
  type:"function",
  execute: async ({ questions }) => {
    return questions.map((question) => {
      return `Further analyze the question ${question} and search the web for information`;
    });
  },
});

export enum ToolEnumType {
  SEARCH = 'search',
  CALCULATOR = 'calculator',
  WEATHER = 'weather',
  PLANNER = 'planner',
  READER = 'reader',
}

export type AiSdkTools = Record<ToolEnumType, Tool>;

export const aiSdkTools: AiSdkTools = {
  [ToolEnumType.SEARCH]: searchTool,
  [ToolEnumType.CALCULATOR]: calculatorTool,
  [ToolEnumType.WEATHER]: weatherTool,
  [ToolEnumType.PLANNER]: plannerTool,
  [ToolEnumType.READER]: readerTool,
};
