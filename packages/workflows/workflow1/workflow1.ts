import {
  AgentContextManager,
  AgentGraph,
  AgentGraphEvents
} from "@repo/ai";
import { ModelEnum } from "@repo/ai/models";
import { getPrompt } from "../prompts";


export async function workflow1(
  events: AgentGraphEvents,
  contextManager: AgentContextManager
): Promise<AgentGraph> {
  const graph = new AgentGraph(events, contextManager);

  const initiatorPrompt = await getPrompt("initiator");
  const plannerPrompt = await getPrompt("planner");
  const reflectionPrompt = await getPrompt("reflection");
  const summarizerPrompt = await getPrompt("summarizer");

  graph.addNode({
    id: "initiator",
    name: "Initiator",
    role: "assistant",
    outputAsReasoning: true,
    model: ModelEnum.O3_Mini,
    systemPrompt: initiatorPrompt,
    isStep: true
  });

  // graph.addNode({
  //   id: "planner",
  //   name: "Planner",
  //   role: "assistant",
  //   systemPrompt: plannerPrompt,
  //   model: ModelEnum.GEMINI_2_FLASH,
  //   tools: [ToolEnumType.SEARCH, ToolEnumType.READER],
  //   toolSteps: 20,
  //   isStep: true
  // });

  // graph.addNode({
  //   id: "reflection",
  //   name: "Reflection",
  //   outputAsReasoning: true,
  //   role: "assistant",
  //   model: ModelEnum.O3_Mini,
  //   systemPrompt: reflectionPrompt,
  //   isStep: true
  // });

  // graph.addNode({
  //   id: "summarizer",
  //   name: "Summarizer",
  //   role: "assistant",
  //   model: ModelEnum.GEMINI_2_FLASH,
  //   systemPrompt: summarizerPrompt
  // });

  // graph.addEdge<"sequential">({
  //   from: "initiator",
  //   to: "planner",
  //   pattern: "sequential",
  //   config: {
  //     priority: 1,
  //     inputTransform: (input: InputTransformArg) => input.input,
  //     outputTransform: (responses: OutputTransformArg) => responses.responses[0]
  //   }
  // });

  // graph.addEdge<"loop">({
  //   from: "planner",
  //   to: "reflection",
  //   pattern: "loop",
  //   config: {
  //     maxIterations: 4,
  //     stopCondition: (condition: ConditionConfigArg) =>
  //       condition.response.includes("Do you believe you now have enough information to craft a comprehensive answer?"),
  //     inputTransform: (input: InputTransformArg) => {
  //       console.log("loop input", input);
  //       const prevReasonings = input.nodes
  //         .filter((node) => ["Reflection", "Initiator"].includes(node.key))
  //         .map((node) => node.output)
  //         .join("\n\n");
  //       return `**Initial Query:** ${input.nodes[0]?.input}\n\n**Previous reasonings:**\n\n ${prevReasonings}\n\n**Current Findings:** ${input.input}`;
  //     },
  //     outputTransform: (responses: OutputTransformArg) => responses.responses?.join("\n\n")
  //   }
  // });

  // graph.addEdge<"sequential">({
  //   from: "reflection",
  //   to: "summarizer",
  //   pattern: "sequential",
  //   config: {
  //     priority: 1,
  //     inputTransform: (input: InputTransformArg) => input.input,
  //     outputTransform: (responses: OutputTransformArg) => responses.responses[0]
  //   }
  // });

  return graph;
}
