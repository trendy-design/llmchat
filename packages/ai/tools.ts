import { Tool, tool } from 'ai';
import { z } from 'zod';

export const getSERPResults = async (queries: string[]) => {
  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", process.env.SERPER_API_KEY || '');
  myHeaders.append("Content-Type", "application/json");
  
  const raw = JSON.stringify(queries.map((query) => ({
    q: query
  })));
  
  const requestOptions = {
    method: "POST" as const,
    headers: myHeaders,
    body: raw,
    redirect: "follow" as const
  };
  try {
    const response = await fetch("https://google.serper.dev/search", requestOptions);
    const batchResult = await response.json();

    // Map each query's organic results, flatten into a single array, then remove duplicates based on the 'link'.
    const organicResultsLists = batchResult?.map((result: any) => result.organic) || [];
    const allOrganicResults = organicResultsLists.flat();
    const uniqueOrganicResults = allOrganicResults.filter(
      (result: any, index: number, self: any[]) =>
        index === self.findIndex((r: any) => r?.link === result?.link)
    );
    
    return uniqueOrganicResults.slice(0, 5);
  } catch (error) {
    console.error(error);
  };
}

const getWebPageContent = async (url: string) => {
  try {
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
  console.log('content', content.length);

  if (!content) return '';

    return `${title}${description}${content}${sourceUrl}`;
  } catch (error) {
    console.error(error);
    return `No Result Found for ${url}`;
  }
}

export const searchTool = tool({
  description: 'Search the web for information',
  parameters: z.object({
    queries: z.array(z.string()).describe('The distinct queries to search the web for information. Maximum 2 queries allowed.'),
  }),
  type:"function",
  execute: async ({ queries }) => {
    const allowedQueries = queries.slice(0, 2);

    const results = await getSERPResults(allowedQueries);
    console.log('searchTool results', results.length);

    return results;
  },
});


export const readerTool = tool({
  description: 'Read the web pages information from the given urls',
  parameters: z.object({
    urls: z.array(z.string()).max(10).describe('The urls to read the web page information from. Maximum 10 urls allowed.')  }),
  type:"function",
  execute: async ({ urls }) => {
    console.log('readerTool urls', urls);
    const result = await Promise.all(urls.map(async (url) => {
      const result = await getWebPageContent(url);
      return result;
    }));
    console.log('result', result.length);
    
    const combinedResult = result.join('\n\n');
    const words = combinedResult.split(/\s+/).length;
    
    if (words > 2000) {
      return combinedResult.split(/\s+/).slice(0, 2000).join(' ');
    }
    
    return combinedResult;
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
