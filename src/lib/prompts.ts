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
