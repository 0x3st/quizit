"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Brain, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuizConfigForm } from "@/components/quiz-config-form";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import Link from "next/link";

export default function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!resolvedParams) {
    params.then(setResolvedParams);
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  return <MaterialDetail id={resolvedParams.id} />;
}

function MaterialDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: material, isLoading, mutate } = useSWR<any>(`/api/materials/${id}`, fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this material and all related quizzes?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/materials/${id}`, { method: "DELETE" });
      toast.success("Material deleted");
      router.push("/materials");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleReparse = async () => {
    await fetch(`/api/materials/${id}/reparse`, { method: "POST" });
    toast.success("Re-parsing started");
    mutate();
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!material) return <p>Material not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/materials"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{material.originalName}</h1>
          <p className="text-sm text-muted-foreground">{material.extension.toUpperCase()} · {(material.fileSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <Badge variant={material.parseStatus === "PARSED" ? "default" : material.parseStatus === "FAILED" ? "destructive" : "secondary"}>
          {material.parseStatus}
        </Badge>
      </div>

      <div className="flex gap-2">
        {material.parseStatus === "PARSED" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Brain className="h-4 w-4 mr-2" />Generate Quiz</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Quiz Configuration</DialogTitle></DialogHeader>
              <QuizConfigForm materialId={id} onSuccess={() => { setDialogOpen(false); router.push("/quizzes"); }} />
            </DialogContent>
          </Dialog>
        )}
        {material.parseStatus === "FAILED" && (
          <Button variant="outline" onClick={handleReparse}><RefreshCw className="h-4 w-4 mr-2" />Re-parse</Button>
        )}
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-4 w-4 mr-2" />{deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>

      {material.content && (
        <Card>
          <CardHeader><CardTitle className="text-base">Parsed Content</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm whitespace-pre-wrap font-sans">{material.content}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {material.parseError && (
        <Card className="border-destructive">
          <CardHeader><CardTitle className="text-base text-destructive">Parse Error</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{material.parseError}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
