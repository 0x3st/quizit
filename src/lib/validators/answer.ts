import { z } from "zod";

export const answerSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      userAnswer: z.unknown(),
    })
  ).min(1, "At least one answer required"),
});
