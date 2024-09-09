const relatedQuestionsSystemPrompt = `You're an helpful assistant`;

const relatedQuestionsUserPrompt = (message: string, response: string) => `
Given the initial message and the AI's response, act as a user and determine what you would ask or answer next based on the AI's response.
Initial Message: """ ${message} """
AI Response: """ ${response} """
What would your next 2-3 short questions or response be as a user?
`;

const googleSearchPrompt = (input: string, information: string) =>
  `Answer the following question based on the information provided. Question: ${input} \n\n Information: \n\n ${information}`;

export {
  googleSearchPrompt,
  relatedQuestionsSystemPrompt,
  relatedQuestionsUserPrompt,
};
