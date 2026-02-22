import type { Difficulty, QuestionType } from "@prisma/client";

const PROMPT_VERSION = process.env.PROMPT_VERSION || "v1";

export function buildQuizPrompt(params: {
  content: string;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  title?: string;
}) {
  const typeDescriptions: Record<QuestionType, string> = {
    SINGLE_CHOICE: "Single choice (one correct answer from options)",
    MULTIPLE_CHOICE: "Multiple choice (multiple correct answers from options)",
    TRUE_FALSE: "True or False",
    FILL_BLANK: "Fill in the blank (short exact answer)",
    SHORT_ANSWER: "Short answer (open-ended, 1-3 sentences)",
    MATCHING: "Matching (pair items from two columns)",
  };

  const allowedTypes = params.questionTypes
    .map((t) => `- ${t}: ${typeDescriptions[t]}`)
    .join("\n");

  return {
    version: PROMPT_VERSION,
    system: `You are an expert quiz generator. Generate high-quality quiz questions from educational content. Output valid JSON only.`,
    user: `Generate a quiz from the following courseware content.

Requirements:
- Number of questions: ${params.questionCount}
- Difficulty: ${params.difficulty}
- Allowed question types (distribute evenly):
${allowedTypes}

Rules:
- Each question must be directly based on the provided content
- Provide clear, unambiguous questions
- For SINGLE_CHOICE: "options" is string[], "correctAnswer" is the correct option string
- For MULTIPLE_CHOICE: "options" is string[], "correctAnswer" is string[] of correct options
- For TRUE_FALSE: "options" is ["True", "False"], "correctAnswer" is "True" or "False"
- For FILL_BLANK: "options" is null, "correctAnswer" is string (the answer)
- For SHORT_ANSWER: "options" is null, "correctAnswer" is string (reference answer)
- For MATCHING: "options" is string[] (right column), "correctAnswer" is Record<string, string> mapping left to right
- Include a brief explanation for each question
- Points: 1 for easy, 2 for medium, 3 for hard

Content:
---
${params.content}
---`,
  };
}
