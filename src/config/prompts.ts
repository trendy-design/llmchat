const relatedQuestionsSystemPrompt = `You're an helpful assistant`;

const relatedQuestionsUserPrompt = (message: string, response: string) => `
Given the initial message and the AI's response, act as a user and determine what you would ask or answer next based on the AI's response.
Initial Message: """ ${message} """
AI Response: """ ${response} """
What would your next question or response be as a user?
`;

export { relatedQuestionsSystemPrompt, relatedQuestionsUserPrompt };
