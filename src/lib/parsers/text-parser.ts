import { normalizeText } from "./utils";

export async function parseText(buffer: Buffer): Promise<string> {
  return normalizeText(buffer.toString("utf-8"));
}
