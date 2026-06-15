import Anthropic from "@anthropic-ai/sdk";
import { Bundle, BundleRecommendation, CustomerAnswers } from "../types";

const MODEL = "claude-sonnet-4-6";

const RECOMMEND_TOOL: Anthropic.Tool = {
  name: "recommend_bundle",
  description: "Select the single best-matching product bundle for the customer and explain why.",
  input_schema: {
    type: "object",
    properties: {
      bundleId: {
        type: "string",
        description: "The `id` of the chosen bundle from the provided catalog.",
      },
      reasoning: {
        type: "string",
        description: "A short, customer-facing explanation (1-2 sentences) of why this bundle fits their needs.",
      },
    },
    required: ["bundleId", "reasoning"],
  },
};

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("Missing or invalid ANTHROPIC_API_KEY in environment variables.");
  }
  return new Anthropic({ apiKey });
}

/**
 * Asks Claude to pick the best-matching bundle from the catalog based on the
 * customer's qualifier answers, and to explain the recommendation.
 */
export async function getClaudeRecommendation(
  answers: CustomerAnswers,
  catalog: Bundle[]
): Promise<BundleRecommendation> {
  const client = getClient();

  const catalogSummary = catalog.map((bundle) => ({
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    tags: bundle.tags ?? [],
    totalPrice: bundle.totalPrice,
    products: bundle.products.map((product) => product.name),
  }));

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [RECOMMEND_TOOL],
    tool_choice: { type: "tool", name: "recommend_bundle" },
    messages: [
      {
        role: "user",
        content: `A customer is configuring a device through a guided selling tool. Based on their answers, recommend the single best-matching bundle from the catalog below.

Customer answers:
- Device type: ${answers.deviceType}
- Industry: ${answers.industry}
- Primary use case: ${answers.useCase}
- Job title: ${answers.jobTitle}

Bundle catalog (JSON):
${JSON.stringify(catalogSummary, null, 2)}

Choose the bundle whose tags and description best align with the customer's answers.`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return a bundle recommendation.");
  }

  const { bundleId, reasoning } = toolUse.input as { bundleId: string; reasoning: string };

  const bundle = catalog.find((b) => b.id === bundleId);
  if (!bundle) {
    throw new Error(`Claude recommended an unknown bundle id: ${bundleId}`);
  }

  return { bundle, reasoning };
}
