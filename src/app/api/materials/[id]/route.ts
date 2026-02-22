import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseFile } from "@/lib/parsers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await db.material.findUnique({ where: { id } });
  if (!material) return errorResponse("NOT_FOUND", "Material not found", 404);
  return successResponse(material);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.material.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch {
    return errorResponse("NOT_FOUND", "Material not found", 404);
  }
}
