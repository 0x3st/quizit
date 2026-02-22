import { normalizeText, withTimeout } from "./utils";

export async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse") as any).default ?? (await import("pdf-parse"));
  const result = await withTimeout(pdfParse(buffer), 60000);
  return normalizeText((result as any).text);
}
