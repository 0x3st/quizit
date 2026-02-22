import { z } from "zod";

const ALLOWED_EXTENSIONS = ["pdf", "pptx", "txt", "md"];
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
];
const MAX_SIZE = (parseInt(process.env.MAX_UPLOAD_MB || "25")) * 1024 * 1024;

export const materialUploadSchema = z.object({
  filename: z.string().min(1),
  extension: z.string().refine((ext) => ALLOWED_EXTENSIONS.includes(ext.toLowerCase()), {
    message: `Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
  }),
  mimeType: z.string().refine((mime) => ALLOWED_MIMES.includes(mime), {
    message: `Allowed MIME types: ${ALLOWED_MIMES.join(", ")}`,
  }),
  fileSize: z.number().max(MAX_SIZE, `File size must be under ${MAX_SIZE / 1024 / 1024}MB`),
});
