import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, paginationParams } from "@/lib/api-response";
import { parseFile } from "@/lib/parsers";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = ["pdf", "pptx", "txt", "md"];
const MAGIC_BYTES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  pptx: [0x50, 0x4b, 0x03, 0x04],
};
const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_MB || "25")) * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("NO_FILE", "No file provided", 400);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return errorResponse("INVALID_TYPE", `Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`, 400);
    }
    if (file.size > MAX_SIZE) {
      return errorResponse("FILE_TOO_LARGE", `Max size: ${MAX_SIZE / 1024 / 1024}MB`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const magic = MAGIC_BYTES[ext];
    if (magic && !magic.every((b, i) => buffer[i] === b)) {
      return errorResponse("INVALID_FILE", "File content does not match extension", 400);
    }

    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = await db.material.findUnique({ where: { sha256 } });
    if (existing) return errorResponse("DUPLICATE", "File already uploaded", 409);

    const material = await db.material.create({
      data: {
        filename: `${sha256.slice(0, 8)}.${ext}`,
        originalName: file.name,
        extension: ext,
        mimeType: file.type,
        fileSize: file.size,
        sha256,
        parseStatus: "PARSING",
      },
    });

    parseFile(buffer, ext)
      .then(async (content) => {
        await db.material.update({
          where: { id: material.id },
          data: { content, parseStatus: "PARSED" },
        });
      })
      .catch(async (err) => {
        await db.material.update({
          where: { id: material.id },
          data: { parseStatus: "FAILED", parseError: (err as Error).message },
        });
      });

    return successResponse(material, undefined, 201);
  } catch (err) {
    return errorResponse("UPLOAD_ERROR", (err as Error).message, 500);
  }
}

export async function GET(request: NextRequest) {
  const { page, pageSize, skip } = paginationParams(request.nextUrl.searchParams);
  const [materials, total] = await Promise.all([
    db.material.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: { id: true, originalName: true, extension: true, fileSize: true, parseStatus: true, createdAt: true },
    }),
    db.material.count(),
  ]);
  return successResponse(materials, { page, pageSize, total });
}
