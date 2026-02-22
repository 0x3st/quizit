"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, ArrowRight, Send, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { QuestionWrapper } from "@/components/questions/QuestionWrapper";
import { useQuizStore } from "@/stores/quiz-store";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Timer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
      <Clock className="h-4 w-4" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export default function TakeQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  return <TakeQuiz quizId={quizId} />;
}

function TakeQuiz({ quizId }: { quizId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt");
  const { data: quiz, isLoading } = useSWR<any>(`/api/quizzes/${quizId}`, fetcher);
  const store = useQuizStore();

  useEffect(() => {
    if (quiz?.questions && store.questions.length === 0) {
      store.setQuestions(quiz.questions);
      if (attemptId) store.setAttemptId(attemptId);
    }
  }, [quiz]);

  const handleSubmit = async () => {
    if (!store.attemptId) { toast.error("No attempt ID"); return; }
    // AUDIT-SUGGESTION: The native `confirm()` dialog is blocking and provides a poor user experience.
    // It should be replaced with the non-blocking `AlertDialog` from shadcn/ui.
    // This requires adding the `AlertDialog` component and managing its state.
    const unanswered = store.questions.filter((q) => !(q.id in store.answers));
    if (unanswered.length > 0 && !confirm(`${unanswered.length} unanswered questions. Submit anyway?`)) return;

    store.setSubmitting(true);
    try {
      const answers = store.questions.map((q) => ({
        questionId: q.id,
        userAnswer: store.answers[q.id] ?? null,
      }));
      const res = await fetch(`/api/attempts/${store.attemptId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      toast.success("Quiz submitted!");
      store.reset();
      router.push(`/result/${store.attemptId || attemptId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      store.setSubmitting(false);
    }
  };

  if (isLoading || store.questions.length === 0) {
    return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const current = store.questions[store.currentIndex];
  const answered = Object.keys(store.answers).length;
  const total = store.questions.length;
  const progressPct = (answered / total) * 100;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between border-b px-4 h-14 shrink-0">
        <h1 className="text-sm font-semibold truncate max-w-[200px]">{quiz?.title}</h1>
        <div className="flex items-center gap-4">
          <Timer startTime={store.startTime} />
          <span className="text-sm text-muted-foreground">{answered}/{total}</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="mb-4">Questions</SheetTitle>
              <div className="grid grid-cols-5 gap-2">
                {store.questions.map((q, i) => (
                  <button key={q.id} onClick={() => store.goToQuestion(i)}
                    aria-label={`Go to question ${i + 1}`}
                    className={cn("h-9 w-9 rounded text-xs font-medium border transition-colors",
                      i === store.currentIndex && "ring-2 ring-primary",
                      q.id in store.answers ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <Progress value={progressPct} className="h-1 rounded-none" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <QuestionWrapper number={store.currentIndex + 1} content={current.content} points={current.points} type={current.type}>
                <QuestionRenderer
                  question={current}
                  value={store.answers[current.id]}
                  onChange={(v) => store.setAnswer(current.id, v)}
                  disabled={store.isSubmitting}
                />
              </QuestionWrapper>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t px-4 py-3 flex items-center justify-between shrink-0">
        <Button variant="outline" onClick={store.prevQuestion} disabled={store.currentIndex === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />Prev
        </Button>
        <div className="flex gap-2">
          {store.currentIndex === total - 1 ? (
            <Button onClick={handleSubmit} disabled={store.isSubmitting}>
              <Send className="h-4 w-4 mr-2" />{store.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button onClick={store.nextQuestion}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
