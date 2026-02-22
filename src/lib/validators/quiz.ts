import { z } from "zod";

export const quizConfigSchema = z.object({
  materialId: z.string().min(1),
  title: z.string().optional(),
  questionCount: z.number().int().min(5).max(30).default(10),
  questionTypes: z
    .array(z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK", "SHORT_ANSWER", "MATCHING"]))
    .min(1, "Select at least one question type"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
});
