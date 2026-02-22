import { parsePdf } from "./pdf-parser";
import { parsePptx } from "./pptx-parser";
import { parseText } from "./text-parser";

const PARSER_MAP: Record<string, (buffer: Buffer) => Promise<string>> = {
  ".pdf": parsePdf,
  ".pptx": parsePptx,
  ".txt": parseText,
  ".md": parseText,
};

export async function parseFile(buffer: Buffer, extension: string): Promise<string> {
  const ext = extension.toLowerCase().startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  const parser = PARSER_MAP[ext];
  if (!parser) throw new Error(`Unsupported file type: ${ext}`);
  return parser(buffer);
}
