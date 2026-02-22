"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Trophy, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ReviewAnswer } from "@/components/questions/ReviewAnswer";
import { fetcher } from "@/lib/fetcher";

export default function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  return <ResultDetail attemptId={attemptId} />;
}

function ResultDetail({ attemptId }: { attemptId: string }) {
  const { data: attempt, isLoading } = useSWR<any>(`/api/attempts/${attemptId}`, fetcher);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!attempt) return <p className="p-6">Attempt not found</p>;

  const score = attempt.score ?? 0;
  const total = attempt.totalPoints ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const correct = attempt.answers?.filter((a: any) => a.isCorrect === true).length ?? 0;
  const incorrect = attempt.answers?.filter((a: any) => a.isCorrect === false).length ?? 0;
  const needsReview = attempt.answers?.filter((a: any) => a.isCorrect === null).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard"><Home className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-bold">Quiz Results</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Quiz score: ${pct}%`}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={`${pct * 2.64} 264`} strokeLinecap="round"
                  className={pct >= 70 ? "text-green-500" : pct >= 40 ? "text-yellow-500" : "text-destructive"} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">{score} / {total} points</p>
              <p className="text-sm text-muted-foreground">{attempt.quiz?.title}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-green-600">{correct} correct</span>
              <span className="text-destructive">{incorrect} incorrect</span>
              {needsReview > 0 && <span className="text-yellow-600">{needsReview} review</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Question Review</h2>
        {attempt.answers
          ?.sort((a: any, b: any) => a.question.order - b.question.order)
          .map((answer: any) => (
            <ReviewAnswer
              key={answer.id}
              question={answer.question}
              userAnswer={answer.userAnswer}
              isCorrect={answer.isCorrect}
              points={answer.points}
            />
          ))}
      </div>

      <div className="flex justify-center gap-4 pb-8">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/quizzes">More Quizzes</Link>
        </Button>
      </div>
    </div>
  );
}
