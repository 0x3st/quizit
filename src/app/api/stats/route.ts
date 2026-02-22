import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const [materials, quizzes, attempts] = await Promise.all([
    db.material.count(),
    db.quiz.count(),
    db.quizAttempt.count({ where: { status: "COMPLETED" } }),
  ]);
  return successResponse({ materials, quizzes, attempts });
}
