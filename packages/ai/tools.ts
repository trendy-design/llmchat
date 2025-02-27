import { Tool, tool } from 'ai';
import { z } from 'zod';

export const getSERPResults = async (queries: string[]) => {
  const myHeaders = new Headers();
  myHeaders.append('X-API-KEY', process.env.SERPER_API_KEY || '');
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify(
    queries.map(query => ({
      q: query,
    }))
  );

  const requestOptions = {
    method: 'POST' as const,
    headers: myHeaders,
    body: raw,
    redirect: 'follow' as const,
  };
  try {
    const response = await fetch('https://google.serper.dev/search', requestOptions);
    const batchResult = await response.json();

    // Map each query's organic results, flatten into a single array, then remove duplicates based on the 'link'.
    const organicResultsLists = batchResult?.map((result: any) => result.organic) || [];
    const allOrganicResults = organicResultsLists.flat();
    const uniqueOrganicResults = allOrganicResults.filter(
      (result: any, index: number, self: any[]) =>
        index === self.findIndex((r: any) => r?.link === result?.link)
    );

    return uniqueOrganicResults.slice(0, 10).map((item: any) => ({ title: item.title, link: item.link  }));
  } catch (error) {
    console.error(error);
  }
};

const getWebPageContent = async (url: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/reader`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const result = await response.json();
    const title = result?.result?.title ? `# ${result.result.title}\n\n` : '';
    const description = result?.result?.description ? `${result.result.description}\n\n` : '';
    const sourceUrl = result?.result?.url
      ? `Source: [${result.result.url}](${result.result.url})\n\n`
      : '';
    const content = result?.result?.markdown || result?.result?.content || '';
    console.log('content', content.length);

    if (!content) return '';

    return `${title}${description}${content}${sourceUrl}`;
  } catch (error) {
    console.error(error);
    return `No Result Found for ${url}`;
  }
};

export const searchTool = ({cb}:{cb: (event: string, data: any) => void}) => {
  return tool({
  description: 'Search the web for information',
  parameters: z.object({
    queries: z
      .array(z.string())
      .describe(
        'The distinct queries to search the web for information. Maximum 2 queries allowed.'
      ),
  }),
  type: 'function',
  execute: async ({ queries }) => {
    const allowedQueries = queries.slice(0, 2);

    const results = await getSERPResults(allowedQueries);

    cb('searchTool', { queries: allowedQueries, results });

    console.log('searchTool queries', allowedQueries);
    console.log('searchTool results', results.length);

    return results;
  },
})
}

export const readerTool = tool({
  description: 'Read the web pages information from the given urls',
  parameters: z.object({
    urls: z
      .array(z.string())
      .max(10)
      .describe('The urls to read the web page information from. Maximum 10 urls allowed.'),
  }),
  type: 'function',
  execute: async ({ urls }) => {
    console.log('readerTool urls', urls);
    const result = await Promise.all(
      urls.map(async url => {
        const result = await getWebPageContent(url);
        return result;
      })
    );
    console.log('result', result.length);

    const combinedResult = result.join('\n\n');
    const words = combinedResult.split(/\s+/).length;

    if (words > 5000) {
      return combinedResult.split(/\s+/).slice(0, 5000).join(' ');
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
  type: 'function',
  execute: async ({ operation }) => {
    return { result: `Performed ${operation}` };
  },
});

export const weatherTool = tool({
  description: 'Get weather information for a location',
  parameters: z.object({
    location: z.string().min(1).describe('The location to get the weather for'),
  }),
  type: 'function',
  execute: async ({ location }) => {
    const temperature = 72 + Math.floor(Math.random() * 21) - 10;
    return { location, temperature };
  },
});

export const plannerTool = tool({
  description:
    'You are a careful, step‐by‐step research assistant. For any question the user asks, you will first create a brief workflow or outline of how you intend to investigate the question.',
  parameters: z.object({
    questions: z.array(z.string()).describe('The questions to plan a task for'),
  }),
  type: 'function',
  execute: async ({ questions }) => {
    return questions.map(question => {
      return `Further analyze the question ${question} and search the web for information`;
    });
  },
});

const webbrowsingTool = ({emit}:{emit: (event: string, data: any) => void}) => {
  return tool({
    description: 'Search the web for information. max 2 queries allowed',
    parameters: z.object({
      queries: z.array(z.string()).describe('The queries to search the web for information. max 2 queries allowed'),
    }),
    execute: async ({ queries }) => {
      const webSearchResults = await Promise.all(queries.map(async (query) => {
        const result = await getSERPResults([query]);
        return result;
      }));

      const uniqueWebSearchResults = webSearchResults.flat().filter((result, index, self) =>
        index === self.findIndex((t) => t.link === result.link)
      );

      emit('search', { queries, uniqueWebSearchResults });

      const webPageContents = await Promise.all(uniqueWebSearchResults.map(async (result) => {
        const content = await getWebPageContent(result.link);
        return {
          title: result.title,
          link: result.link,
          content,
        };
      }));

      return webPageContents;
    },
  });
};

export enum ToolEnumType {
  SEARCH = 'search',

}

export type AiSdkTools = Record<ToolEnumType, Tool>;

export const aiSdkTools: Record<ToolEnumType, (emit: (event: string, data: any) => void) => Tool> = {
  [ToolEnumType.SEARCH]: (emit) => webbrowsingTool({ emit }),

};


