import Anthropic from "@anthropic-ai/sdk";
import { CustomerAnswers } from "../types";
import { CaseProduct } from "./redzoneCatalog";
import { UseCase } from "./useCases";

const MODEL = "claude-sonnet-4-6";

const SELECT_CASE_TOOL: Anthropic.Tool = {
  name: "select_case",
  description: "Select the best-fitting case style for the customer's device and explain why.",
  input_schema: {
    type: "object",
    properties: {
      caseSku: {
        type: "string",
        description: "The `sku` of the chosen case from the provided options.",
      },
      reasoning: {
        type: "string",
        description:
          "A short, customer-facing explanation (1-2 sentences) of why this case style and the included mount/accessories fit their role and use case.",
      },
    },
    required: ["caseSku", "reasoning"],
  },
};

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("Missing or invalid ANTHROPIC_API_KEY in environment variables.");
  }
  return new Anthropic({ apiKey });
}

export interface CaseRecommendation {
  caseSku: string;
  reasoning: string;
}

/**
 * Asks Claude to pick the best-fitting case style from the options compatible
 * with the customer's device, and to explain how the case + mount/accessories
 * (determined by their use case) fit their role.
 */
export async function getClaudeCaseRecommendation(
  answers: CustomerAnswers,
  caseOptions: CaseProduct[],
  useCase: UseCase
): Promise<CaseRecommendation> {
  const client = getClient();

  const caseOptionsSummary = caseOptions.map((c) => ({
    sku: c.sku,
    name: c.name,
    style: c.style,
    styleDescription: c.styleDescription,
    price: c.price,
  }));

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [SELECT_CASE_TOOL],
    tool_choice: { type: "tool", name: "select_case" },
    messages: [
      {
        role: "user",
        content: `A customer is configuring a RedZone device kit through a guided selling tool. Based on their answers, choose the single best-fitting case from the options below and explain the overall recommendation.

Customer answers:
- Device type: ${answers.deviceType}
- Industry: ${answers.industry}
- Job title: ${answers.jobTitle}
- Primary use case: ${useCase.title} — ${useCase.description}

Their use case also determines the mount and accessories that will be included in the bundle:
- Mount: ${useCase.recommendedMount ? useCase.recommendedMount.name : "None"}
- Accessories: ${useCase.recommendedAccessories.length > 0 ? useCase.recommendedAccessories.map((a) => a.name).join(", ") : "None"}

Compatible case options (JSON):
${JSON.stringify(caseOptionsSummary, null, 2)}

Choose the case style that best fits the customer's role and use case, and write a short explanation covering the case, mount, and accessories together.`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return a case recommendation.");
  }

  const { caseSku, reasoning } = toolUse.input as { caseSku: string; reasoning: string };

  const chosenCase = caseOptions.find((c) => c.sku === caseSku);
  if (!chosenCase) {
    throw new Error(`Claude recommended an unknown case sku: ${caseSku}`);
  }

  return { caseSku: chosenCase.sku, reasoning };
}
