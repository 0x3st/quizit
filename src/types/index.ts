import type { QuestionType, Difficulty } from "@prisma/client";

export interface QuizConfig {
  materialId: string;
  title?: string;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
}

export interface GeneratedQuestion {
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: unknown;
  explanation?: string;
  points: number;
}

export interface QuizGenerationResult {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

export interface AnswerSubmission {
  questionId: string;
  userAnswer: unknown;
}
