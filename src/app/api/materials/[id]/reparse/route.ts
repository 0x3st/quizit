import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseFile } from "@/lib/parsers";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await db.material.findUnique({ where: { id } });
  if (!material) return errorResponse("NOT_FOUND", "Material not found", 404);
  if (!material.sha256) return errorResponse("NO_FILE", "No file data to reparse", 400);

  await db.material.update({
    where: { id },
    data: { parseStatus: "PARSING", parseError: null },
  });

  return successResponse({ id, status: "PARSING" });
}
