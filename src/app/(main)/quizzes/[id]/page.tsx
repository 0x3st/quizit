"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Play, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

const TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill Blank",
  SHORT_ANSWER: "Short Answer",
  MATCHING: "Matching",
};

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  if (!resolvedParams) {
    params.then(setResolvedParams);
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }
  return <QuizDetail id={resolvedParams.id} />;
}

function QuizDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: quiz, isLoading } = useSWR<any>(`/api/quizzes/${id}`, fetcher);
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/quizzes/${id}/attempts`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      router.push(`/take/${id}?attempt=${json.data.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!quiz) return <p>Quiz not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/quizzes"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">{quiz.questionCount} questions · {quiz.difficulty}</p>
        </div>
        <Badge variant={quiz.generationStatus === "READY" ? "default" : "secondary"}>{quiz.generationStatus}</Badge>
      </div>

      {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}

      <div className="flex gap-2">
        {quiz.generationStatus === "READY" && (
          <Button onClick={handleStart} disabled={starting}>
            <Play className="h-4 w-4 mr-2" />{starting ? "Starting..." : "Take Quiz"}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild><a href={`/api/quizzes/${id}/export?format=json`} target="_blank">JSON</a></DropdownMenuItem>
            <DropdownMenuItem asChild><a href={`/api/quizzes/${id}/export?format=markdown`} target="_blank">Markdown</a></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {quiz.questions?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Questions Preview</h2>
          {quiz.questions.map((q: any, i: number) => (
            <Card key={q.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-muted-foreground shrink-0">Q{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{q.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{TYPE_LABEL[q.type] || q.type}</Badge>
                      <Badge variant="outline" className="text-xs">{q.points}pt</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
