"use client";

import useSWR from "swr";
import Link from "next/link";
import { FileText, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/SkeletonCard";
import { fetcher } from "@/lib/fetcher";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PARSED: "default",
  PARSING: "secondary",
  UPLOADED: "outline",
  FAILED: "destructive",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsPage() {
  const { data: materials, isLoading } = useSWR<any[]>("/api/materials?pageSize=50", fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Materials</h1>
        <Button asChild>
          <Link href="/materials/upload"><Upload className="h-4 w-4 mr-2" />Upload</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !materials?.length ? (
        <EmptyState icon={FileText} title="No materials" description="Upload your first courseware to get started." action={{ label: "Upload Material", href: "/materials/upload" }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m: any) => (
            <Link key={m.id} href={`/materials/${m.id}`}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2">{m.originalName}</CardTitle>
                    <Badge variant={STATUS_VARIANT[m.parseStatus] || "secondary"} className="shrink-0">{m.parseStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="uppercase font-medium">{m.extension}</span>
                    <span>{formatSize(m.fileSize)}</span>
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
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
