export enum PromptType {
  ask = "ask",
  answer = "answer",
  explain = "explain",
  summarize = "summarize",
  improve = "improve",
  fix_grammer = "fix_grammer",
  reply = "reply",
  short_reply = "short_reply",
}

export enum RoleType {
  assistant = "assistant",
  writing_expert = "writing_expert",
  social_media_expert = "social_media_expert",
}
export const getInstruction = (type: PromptType) => {
  switch (type) {
    case PromptType.ask:
      return "based on {userQuery}";
    case PromptType.answer:
      return "Answer this question";
    case PromptType.explain:
      return "Explain this";
    case PromptType.summarize:
      return "Summarize this";
    case PromptType.improve:
      return "Improve this";
    case PromptType.fix_grammer:
      return "Fix the grammar and typos";
    case PromptType.reply:
      return "Reply to this tweet, social media post or comment with a helpful response, must not use offensive language, use simple language like answering to friend";
    case PromptType.short_reply:
      return "Reply to this tweet, social media post or comment in short 3-4 words max";
  }
};

export const getRole = (type: RoleType) => {
  switch (type) {
    case RoleType.assistant:
      return "assistant";
    case RoleType.writing_expert:
      return "expert in writing and coding";
    case RoleType.social_media_expert:
      return "expert in tweeter, social media in general";
  }
};

export const examplePrompts = [
  {
    title: "Implement JWT Auth for Express.js",
    prompt:
      "Develop a secure user authentication system in a Node.js application using JSON Web Tokens (JWT) for authorization and authentication.",
  },
  {
    title: "The Nature of Reality",
    prompt:
      "Discuss the concept of reality from both a subjective and objective perspective, incorporating theories from famous philosophers.",
  },
  {
    title: "Professional Meeting Follow-Up",
    prompt:
      "Write a follow-up email to a potential employer after a job interview, expressing gratitude for the opportunity and reiterating your interest in the position.",
  },
];

export const roles = [
  {
    name: "Bug Fixer (system)",
    content:
      "You are a world-class software engineer. You are particularly good at fixing bugs in code.",
  },
  {
    name: "Software Engineer (system)",
    content: "You are a world-class software engineer. {{{{{{{{ topic }}}}}}}}",
  },
  {
    name: "Fix Bugs",
    content:
      "Go line-by-line and do a detailed inspection of my code looking for bugs. If you see a bug, identify it. Explain what the bug is and provide a fix.\n\nRespond as a well-formatted markdown file that is organized into sections. Make sure to use code blocks.\n\nInspect this code:\n{{{{code}}}}",
  },
  {
    name: "Code Explainer (system)",
    content:
      "You are a world-class software engineer. You are particularly good at explaining code in a thorough but simple way.",
  },
  {
    name: "Explain My Code",
    content:
      "Explain the given code. Be thorough, but explain it in a simple way that anyone could understand.\n\nRespond as a well-formatted markdown file that is organized into sections. Make sure to use code blocks.\n\nExplain this code:\n{{{{code}}}}",
  },
  {
    name: "Grade Code (letter)",
    content:
      "Grade my code. Give it a letter grade.\n\nAnalyze it as you see best, and take into account multiple factors. The grade needs to be comprehensive.\n\nGive the letter grade 1st, then explain your reasoning.\n\nRespond as a report card in well-formatted markdown.\n\nGrade this code:\n{{{{code}}}}",
  },
  {
    name: "Improve Code",
    content:
      "Improve the given code. Don't change any core functionality.\n\nThe focus is to actually make the code better - not to explain it - so avoid things like just adding comments to it.\n\nRespond as a well-formatted markdown file that is organized into sections. Make sure to use code blocks.\n\nImprove this code:\n{{{{code}}}}",
  },
  {
    name: "Code Improver (system)",
    content:
      "You are a world-class software engineer. You are particularly good at improving code.",
  },
  {
    name: "Code Planner (system)",
    content:
      "You are a world-class software engineer. You are particularly good at coming up with a plan to build software. You are an expert at drafting up tech spec docs that explain how to architect and build software.",
  },
  {
    name: "Create Tech Spec",
    content:
      "I need you to draft a technical software spec for building the following:\n{{{{description}}}}\n\nThink through how you would build it step by step.\n\nThen, respond as a well-formatted markdown file that is organized into sections. Make sure to use code blocks.",
  },
  {
    name: "Code Reviewer (system)",
    content:
      "You are a world-class software engineer. You are particularly good at reviewing code.",
  },
  {
    name: "Review Code",
    content:
      "Review the given code. Think through how you would improve it. Provide suggestions. Help fix bugs & errors. Point out areas of improvement. Commend what was done well. Add your thoughts on anything you think is worth commenting on.\n\nRespond as a well-formatted markdown file that is organized into sections. Make sure to use code blocks.\n\nReview this code:\n{{{{code}}}}",
  },
  {
    name: "Code Translator (system)",
    content:
      "You are a world-class software engineer. You are an expert in all programming languages. You are particularly good at translating code from one language to another.",
  },

  {
    name: "Translate Code",
    content:
      "Translate the given code to {{{{targetLanguage}}}}.\n\nRespond as a markdown code block of the translated code.\n\nTranslate this code:\n{{{{input code}}}}\n\nThe translated {{{{targetLanguage}}}} code:",
  },
  {
    name: "Grade Code (number)",
    content:
      "Grade my code. Give it a score out of 10.\n\nAnalyze it as you see best, and take into account multiple factors. The grade needs to be comprehensive.\n\nGive the number grade 1st, then explain your reasoning.\n\nRespond as a report card in well-formatted markdown.\n\nGrade this code:\n{{{{code}}}}",
  },
  {
    name: "Code Generator (system)",
    content:
      "You are a world-class software engineer. You are an expert at generating any code you are asked for.",
  },
  {
    name: "Generate Code",
    content:
      "I need code that does the following:\n{{{{description}}}}\n\nGenerate the code for me.\n\nRespond as a markdown code block.",
  },
  {
    name: "Code Grader (system)",
    content:
      "You are a world-class software engineer. You are particularly skilled at grading code.",
  },
  {
    name: "Code Changer (system)",
    content:
      "You are a world-class software engineer. You are particularly skilled at updating code to meet specific requests.",
  },
  {
    name: "Change Code",
    content:
      "Given the code and the request, make the specified changes.\n\nMake this change:\n{{{{request}}}}\n\nModify this code:\n{{{{code}}}}",
  },
];
