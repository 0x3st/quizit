import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginationParams } from "@/lib/api-response";
import { quizConfigSchema } from "@/lib/validators/quiz";
import { generateQuiz } from "@/lib/ai/generate-quiz";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quizConfigSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION", parsed.error.issues[0].message, 400);
    }
    const config = parsed.data;

    const material = await db.material.findUnique({ where: { id: config.materialId } });
    if (!material) return errorResponse("NOT_FOUND", "Material not found", 404);
    if (material.parseStatus !== "PARSED" || !material.content) {
      return errorResponse("NOT_PARSED", "Material not yet parsed", 400);
    }

    const quiz = await db.quiz.create({
      data: {
        title: config.title || `Quiz from ${material.originalName}`,
        materialId: material.id,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        generationStatus: "GENERATING",
      },
    });

    generateQuiz(config, material.content)
      .then(async (result) => {
        await db.$transaction([
          db.quiz.update({
            where: { id: quiz.id },
            data: {
              title: result.title,
              description: result.description,
              generationStatus: "READY",
              provider: result.meta.provider,
              model: result.meta.model,
              promptVersion: result.meta.promptVersion,
              inputTokens: result.meta.inputTokens,
              outputTokens: result.meta.outputTokens,
              generationMs: result.meta.durationMs,
              questionCount: result.questions.length,
            },
          }),
          ...result.questions.map((q, i) =>
            db.question.create({
              data: {
                quizId: quiz.id,
                type: q.type,
                content: q.content,
                options: q.options,
                correctAnswer: q.correctAnswer as any,
                explanation: q.explanation,
                points: q.points,
                order: i + 1,
              },
            })
          ),
        ]);
      })
      .catch(async (err) => {
        await db.quiz.update({
          where: { id: quiz.id },
          data: { generationStatus: "FAILED", generationError: (err as Error).message },
        });
      });

    return successResponse(quiz, undefined, 201);
  } catch (err) {
    return errorResponse("GENERATE_ERROR", (err as Error).message, 500);
  }
}

export async function GET(request: NextRequest) {
  const { page, pageSize, skip } = paginationParams(request.nextUrl.searchParams);
  const [quizzes, total] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { material: { select: { originalName: true } } },
    }),
    db.quiz.count(),
  ]);
  return successResponse(quizzes, { page, pageSize, total });
}
