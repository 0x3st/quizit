import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") || "json";
  const quiz = await db.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return errorResponse("NOT_FOUND", "Quiz not found", 404);

  if (format === "markdown") {
    let md = `# ${quiz.title}\n\n${quiz.description || ""}\n\n`;
    quiz.questions.forEach((q, i) => {
      md += `## Question ${i + 1} (${q.points}pt)\n\n${q.content}\n\n`;
      if (q.options && Array.isArray(q.options)) {
        (q.options as string[]).forEach((opt, j) => {
          md += `${String.fromCharCode(65 + j)}. ${opt}\n`;
        });
        md += "\n";
      }
    });
    return new Response(md, {
      headers: { "Content-Type": "text/markdown", "Content-Disposition": `attachment; filename="${quiz.title}.md"` },
    });
  }

  return successResponse(quiz);
}
