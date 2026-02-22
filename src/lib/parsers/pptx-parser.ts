import { normalizeText, withTimeout } from "./utils";

export async function parsePptx(buffer: Buffer): Promise<string> {
  const officeparser = await import("officeparser");
  const parse = (officeparser as any).parseOfficeAsync ?? (officeparser as any).default?.parseOfficeAsync;
  const text = await withTimeout(parse(buffer), 60000);
  return normalizeText(text as string);
}
