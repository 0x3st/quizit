import { create } from "zustand";

// AUDIT-SUGGESTION: The `QuizQuestion` and `QuizState.answers` use `unknown` for `correctAnswer` and the answer value.
// This weakens type safety. A better approach is to define a discriminated union for all question and answer types
// to ensure that the answer for a given question ID matches its expected type.
interface QuizQuestion {
  id: string;
  type: string;
  content: string;
  options: string[] | null;
  correctAnswer: unknown;
  explanation: string | null;
  points: number;
  order: number;
}

interface QuizState {
  questions: QuizQuestion[];
  answers: Record<string, unknown>;
  currentIndex: number;
  startTime: number | null;
  isSubmitting: boolean;
  attemptId: string | null;
  setQuestions: (questions: QuizQuestion[]) => void;
  setAttemptId: (id: string) => void;
  setAnswer: (questionId: string, answer: unknown) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  setSubmitting: (v: boolean) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  answers: {},
  currentIndex: 0,
  startTime: null,
  isSubmitting: false,
  attemptId: null,
  setQuestions: (questions) => set({ questions, currentIndex: 0, answers: {}, startTime: Date.now() }),
  setAttemptId: (attemptId) => set({ attemptId }),
  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),
  nextQuestion: () =>
    set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1) })),
  prevQuestion: () =>
    set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  goToQuestion: (index) => set({ currentIndex: index }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ questions: [], answers: {}, currentIndex: 0, startTime: null, isSubmitting: false, attemptId: null }),
}));
