"use client";

import useSWR from "swr";
import Link from "next/link";
import { Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { fetcher } from "@/lib/fetcher";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  READY: "default",
  GENERATING: "secondary",
  PENDING: "outline",
  FAILED: "destructive",
};

export default function QuizzesPage() {
  const { data: quizzes, isLoading } = useSWR<any[]>("/api/quizzes?pageSize=50", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !quizzes?.length ? (
        <EmptyState icon={Brain} title="No quizzes" description="Generate a quiz from your uploaded materials." action={{ label: "View Materials", href: "/materials" }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q: any) => (
            <Link key={q.id} href={`/quizzes/${q.id}`}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2">{q.title}</CardTitle>
                    <Badge variant={STATUS_VARIANT[q.generationStatus] || "secondary"} className="shrink-0">{q.generationStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{q.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{q.questionCount} questions</span>
                    <span>{q.difficulty}</span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
