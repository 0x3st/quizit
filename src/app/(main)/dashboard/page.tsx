"use client";

import useSWR from "swr";
import Link from "next/link";
import { FileText, Brain, Trophy, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

export default function DashboardPage() {
  const { data: stats } = useSWR<{ materials: number; quizzes: number; attempts: number }>("/api/stats", fetcher);
  const { data: quizzes } = useSWR<any[]>("/api/quizzes?pageSize=5", fetcher);

  const statCards = [
    { label: "Materials", value: stats?.materials, icon: FileText, href: "/materials" },
    { label: "Quizzes", value: stats?.quizzes, icon: Brain, href: "/quizzes" },
    { label: "Completed", value: stats?.attempts, icon: Trophy, href: "/quizzes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/materials/upload"><Upload className="h-4 w-4 mr-2" />Upload</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stats ? (
                  <p className="text-2xl font-bold">{s.value}</p>
                ) : (
                  <Skeleton className="h-8 w-16" />
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {!quizzes ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No quizzes yet. Upload a material to get started.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((q: any) => (
                <Link key={q.id} href={`/quizzes/${q.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.questionCount} questions</p>
                  </div>
                  <Badge variant={q.generationStatus === "READY" ? "default" : "secondary"}>{q.generationStatus}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
