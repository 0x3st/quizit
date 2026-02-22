"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const ALLOWED = [".pdf", ".pptx", ".txt", ".md"];
const MAX_SIZE = 25 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) {
      toast.error(`Unsupported file type. Allowed: ${ALLOWED.join(", ")}`);
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast.error("File too large. Max 25MB.");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      setProgress(30);
      const res = await fetch("/api/materials", { method: "POST", body: formData });
      setProgress(80);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Upload failed");
      setProgress(100);
      toast.success("Material uploaded successfully");
      router.push(`/materials/${json.data.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Material</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Select File</CardTitle></CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Drag and drop or click to select</p>
                <p className="text-xs text-muted-foreground">PDF, PPTX, TXT, MD up to 25MB</p>
                <input type="file" accept=".pdf,.pptx,.txt,.md" onChange={handleSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
              </>
            )}
          </div>
          {uploading && <Progress value={progress} className="mt-4" />}
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full mt-4">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
