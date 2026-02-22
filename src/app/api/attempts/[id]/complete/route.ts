import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { answerSubmitSchema } from "@/lib/validators/answer";

function gradeAnswer(question: any, userAnswer: any): { isCorrect: boolean | null; points: number } {
  const { type, correctAnswer } = question;

  if (userAnswer === null || userAnswer === undefined || userAnswer === "") {
    return { isCorrect: false, points: 0 };
  }

  switch (type) {
    case "SINGLE_CHOICE":
    case "TRUE_FALSE":
      return userAnswer === correctAnswer
        ? { isCorrect: true, points: question.points }
        : { isCorrect: false, points: 0 };

    case "MULTIPLE_CHOICE": {
      const correct = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [];
      const user = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
      const match = JSON.stringify(correct) === JSON.stringify(user);
      return match ? { isCorrect: true, points: question.points } : { isCorrect: false, points: 0 };
    }

    case "FILL_BLANK": {
      const match = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      return match ? { isCorrect: true, points: question.points } : { isCorrect: false, points: 0 };
    }

    case "MATCHING": {
      const correctMap = correctAnswer as Record<string, string>;
      const userMap = userAnswer as Record<string, string>;
      const allCorrect = Object.entries(correctMap).every(([k, v]) => userMap[k] === v);
      return allCorrect ? { isCorrect: true, points: question.points } : { isCorrect: false, points: 0 };
    }

    case "SHORT_ANSWER":
      return { isCorrect: null, points: 0 };

    default:
      return { isCorrect: false, points: 0 };
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = answerSubmitSchema.safeParse(body);
    if (!parsed.success) return errorResponse("VALIDATION", parsed.error.issues[0].message, 400);

    const attempt = await db.quizAttempt.findUnique({
      where: { id },
      include: { quiz: { include: { questions: true } } },
    });
    if (!attempt) return errorResponse("NOT_FOUND", "Attempt not found", 404);
    if (attempt.status !== "IN_PROGRESS") return errorResponse("COMPLETED", "Attempt already completed", 400);

    const questionMap = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    let totalScore = 0;

    const answerData = parsed.data.answers.map((a) => {
      const question = questionMap.get(a.questionId);
      if (!question) throw new Error(`Question ${a.questionId} not found`);
      const grade = gradeAnswer(question, a.userAnswer);
      totalScore += grade.points;
      return {
        attemptId: id,
        questionId: a.questionId,
        userAnswer: a.userAnswer as any,
        isCorrect: grade.isCorrect,
        points: grade.points,
      };
    });

    await db.$transaction([
      db.answer.createMany({ data: answerData }),
      db.quizAttempt.update({
        where: { id },
        data: { status: "COMPLETED", score: totalScore, completedAt: new Date() },
      }),
    ]);

    return successResponse({ attemptId: id, score: totalScore, totalPoints: attempt.totalPoints });
  } catch (err) {
    return errorResponse("SUBMIT_ERROR", (err as Error).message, 500);
  }
}
