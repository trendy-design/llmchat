import { tool } from 'ai';
import { initLogger, traced } from 'braintrust';
import { z } from 'zod';
import { AgentGraph } from '../main';

initLogger({
  projectName: 'LLMChat',
  apiKey: process.env.BRAINTRUST_API_KEY || '',
});


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
    const organicResultsLists = batchResult?.map((result: any) => result.organic?.slice(0, 10)) || [];
    const allOrganicResults = organicResultsLists.flat();
    const uniqueOrganicResults = allOrganicResults.filter(
      (result: any, index: number, self: any[]) =>
        index === self.findIndex((r: any) => r?.link === result?.link)
    );

    return uniqueOrganicResults.slice(0, 10).map((item: any) => ({ title: item.title, link: item.link, snippet: item.snippet }));
  } catch (error) {
    console.error(error);
  }
};

export const  getWebPageContent = async (url: string) => {
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
    const description = result?.result?.description ? `${result.result.description}\n\n ${result.result.content}\n\n` : '';
    const sourceUrl = result?.result?.url
      ? `Source: [${result.result.url}](${result.result.url})\n\n`
      : '';
    const content = result?.result?.markdown || result?.result?.content || '';

    if (!content) return '';

    return `${title}${description}${content}${sourceUrl}`;
  } catch (error) {
    console.error(error);
    return `No Result Found for ${url}`;
  }
};

export const executeWebSearch = async (queries: string[], ) => {
  const webSearchResults = await Promise.all(queries.map(async (query) => {
    const result = await getSERPResults([query]);
    return result.slice(0, 10);
  }));

  const uniqueWebSearchResults = webSearchResults.flat().filter((result, index, self) =>
    index === self.findIndex((t) => t.link === result.link)
  )


  const webPageContents = await Promise.all(uniqueWebSearchResults.map(async (result) => {
    const content = await getWebPageContent(result.link);

    return {
      title: result.title,
      link: result.link,

      content,
    };
  }));

  return webPageContents?.filter((item) => !!item.content).slice(0, 10);
}




export const webbrowsingTool = (graph: AgentGraph) => {
  return tool({
    description: 'Search the web for information. max 2 queries allowed',
    parameters: z.object({
      queries: z.array(z.string()).describe('The queries to search the web for information. max 2 queries allowed'),
    }),
    execute: async ({ queries }) => {

      return traced(async (span)=>{
      // return span.traced(async (span)=>{
      const webSearchResults = await Promise.all(queries.map(async (query) => {
        const result = await getSERPResults([query]);
        return result.slice(0, 5);
      }));

      const uniqueWebSearchResults = webSearchResults.flat().filter((result, index, self) =>
        index === self.findIndex((t) => t.link === result.link)
      )

      graph.updateContext((prev) => ({
        ...prev,
        webSearchResults: [...(prev.webSearchResults || []), ...uniqueWebSearchResults],
      }));

      const webPageContents = await Promise.all(uniqueWebSearchResults.map(async (result) => {
        const content = await getWebPageContent(result.link);

        return {
          title: result.title,
          link: result.link,

          content,
        };
      }));

      span.log({
        input: queries,
        output: webPageContents,
        metadata: {
          webSearchResults: uniqueWebSearchResults
        }
      })


      return webPageContents;
    },{
      name:'web-search',
      type:"tool"
    })
    }
  });
};
