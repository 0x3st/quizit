import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return errorResponse("NOT_FOUND", "Quiz not found", 404);
  if (quiz.generationStatus !== "READY") {
    return errorResponse("NOT_READY", "Quiz is not ready", 400);
  }

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const attempt = await db.quizAttempt.create({
    data: { quizId: id, totalPoints },
  });

  return successResponse(attempt, undefined, 201);
}
