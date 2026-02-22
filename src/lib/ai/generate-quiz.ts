import { generateObject } from "ai";
import { z } from "zod";
import { getProvider } from "./provider";
import { buildQuizPrompt } from "./prompts";
import type { QuizConfig, QuizGenerationResult } from "@/types";

const questionSchema = z.object({
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK", "SHORT_ANSWER", "MATCHING"]),
  content: z.string().min(1),
  options: z.array(z.string()).nullable(),
  correctAnswer: z.unknown(),
  explanation: z.string().optional(),
  points: z.number().int().min(1).max(3),
});

const quizSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  questions: z.array(questionSchema).min(1),
});

function truncateForLLM(text: string, maxChars = 60000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[Content truncated...]";
}

export async function generateQuiz(
  config: QuizConfig,
  materialContent: string
): Promise<QuizGenerationResult & { meta: { provider: string; model: string; promptVersion: string; inputTokens?: number; outputTokens?: number; durationMs: number } }> {
  const truncated = truncateForLLM(materialContent);
  const prompt = buildQuizPrompt({
    content: truncated,
    questionCount: config.questionCount,
    questionTypes: config.questionTypes,
    difficulty: config.difficulty,
    title: config.title,
  });

  const { provider, model } = getProvider();
  const start = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await generateObject({
        model,
        schema: quizSchema,
        system: prompt.system,
        prompt: prompt.user,
        maxRetries: 0,
      });

      const durationMs = Date.now() - start;
      return {
        ...(result.object as QuizGenerationResult),
        meta: {
          provider,
          model: model.modelId,
          promptVersion: prompt.version,
          inputTokens: (result.usage as any)?.promptTokens,
          outputTokens: (result.usage as any)?.completionTokens,
          durationMs,
        },
      };
    } catch (err) {
      lastError = err as Error;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error("Quiz generation failed");
}
