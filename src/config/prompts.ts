const relatedQuestionsSystemPrompt = `You're an helpful assistant`;

const relatedQuestionsUserPrompt = (message: string, response: string) => `
Given the initial message and the AI's response, act as a user and determine what you would ask or answer next based on the AI's response.
Initial Message: """ ${message} """
AI Response: """ ${response} """
What would your next 2-3 short questions or response be as a user?
`;

const vectorSearchSystemPrompt = (similarItems: any[]) => {
  return `You're a helpful assistant. You can refer to given context to answer the query. You can't make up anything though you can inspire from the context. you must cite the source of the information you are using.
        context: ${JSON.stringify(similarItems.map((item: any) => `Title: ${item.metadata.title} \n\n ${item.text} \n\n url: ${item.metadata.source}`))}
        `;
};

const duckDuckGoSearchPropmt = (input: string, information: string) =>
  `Answer the following question from the information provided. Question: ${input} \n\n Information: \n\n ${information}`;

const googleSearchPrompt = (input: string, information: string) =>
  `Answer the following question based on the information provided. Question: ${input} \n\n Information: \n\n ${information}`;

const webPageReaderPrompt =
  "A tool to read a url and extract information from it when specifically asked for.";

const duckDuckGoToolPrompt =
  "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.";

export {
  duckDuckGoSearchPropmt,
  duckDuckGoToolPrompt,
  googleSearchPrompt,
  relatedQuestionsSystemPrompt,
  relatedQuestionsUserPrompt,
  vectorSearchSystemPrompt,
  webPageReaderPrompt,
};
