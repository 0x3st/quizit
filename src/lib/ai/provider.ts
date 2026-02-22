import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export function getProvider() {
  const provider = process.env.AI_PROVIDER || "openai";
  if (provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      ...(process.env.ANTHROPIC_BASE_URL && { baseURL: process.env.ANTHROPIC_BASE_URL }),
    });
    const modelId = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
    return { provider: "anthropic", model: anthropic(modelId) };
  }
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
  });
  const modelId = process.env.OPENAI_MODEL || "gpt-4o-mini";
  return { provider: "openai", model: openai(modelId) };
}
