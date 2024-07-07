import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorTool = () => {
  const calculatorSchema = z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("The type of operation to execute."),
    number1: z.number().describe("The first number to operate on."),
    number2: z.number().describe("The second number to operate on."),
  });

  return new DynamicStructuredTool({
    name: "calculator",
    description: "Can perform mathematical operations.",
    schema: calculatorSchema,
    func: async ({ operation, number1, number2 }) => {
      // Functions must return strings
      if (operation === "add") {
        return `${number1 + number2}`;
      } else if (operation === "subtract") {
        return `${number1 - number2}`;
      } else if (operation === "multiply") {
        return `${number1 * number2}`;
      } else if (operation === "divide") {
        return `${number1 / number2}`;
      } else {
        throw new Error("Invalid operation.");
      }
    },
  });
};

export { calculatorTool };
