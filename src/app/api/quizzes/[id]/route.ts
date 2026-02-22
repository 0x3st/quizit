import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id },
    include: {
      material: { select: { originalName: true } },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!quiz) return errorResponse("NOT_FOUND", "Quiz not found", 404);
  return successResponse(quiz);
}
