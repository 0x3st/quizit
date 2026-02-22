import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = await db.quizAttempt.findUnique({
    where: { id },
    include: {
      quiz: { select: { title: true } },
      answers: { include: { question: true } },
    },
  });
  if (!attempt) return errorResponse("NOT_FOUND", "Attempt not found", 404);
  return successResponse(attempt);
}
