import { initiatorPrompt } from "./initiator";
import { plannerPrompt } from "./planner";
import { reflectionPrompt } from "./reflection";
import { researcherPrompt } from "./researcher";
import { summarizerPrompt } from "./summarizer";

export async function getPrompt(name: string) {
  switch (name) {
    case "initiator":
      return initiatorPrompt;
    case "planner":
      return plannerPrompt;
    case "reflection":
      return reflectionPrompt;
    case "researcher":
      return researcherPrompt;
    case "summarizer":
      return summarizerPrompt;
    default:
      throw new Error(`Prompt ${name} not found`);
  }
}