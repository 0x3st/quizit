import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReviewAnswerProps {
  question: {
    type: string;
    content: string;
    options: string[] | null;
    correctAnswer: unknown;
    explanation: string | null;
    points: number;
    order: number;
  };
  userAnswer: unknown;
  isCorrect: boolean | null;
  points: number;
}

const TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill Blank",
  SHORT_ANSWER: "Short Answer",
  MATCHING: "Matching",
};

function formatAnswer(answer: unknown, type: string): string {
  if (answer === null || answer === undefined) return "(no answer)";
  if (Array.isArray(answer)) return answer.join(", ");
  if (typeof answer === "object") {
    return Object.entries(answer as Record<string, string>)
      .map(([k, v]) => `${k} → ${v}`)
      .join(", ");
  }
  return String(answer);
}

export function ReviewAnswer({ question, userAnswer, isCorrect, points }: ReviewAnswerProps) {
  const StatusIcon = isCorrect === true ? CheckCircle2 : isCorrect === false ? XCircle : HelpCircle;
  const statusColor = isCorrect === true ? "text-green-600" : isCorrect === false ? "text-destructive" : "text-yellow-600";

  return (
    <Card className={cn("border-l-4", isCorrect === true ? "border-l-green-500" : isCorrect === false ? "border-l-destructive" : "border-l-yellow-500")}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <StatusIcon className={cn("h-5 w-5 mt-0.5 shrink-0", statusColor)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">Q{question.order}</span>
              <Badge variant="outline" className="text-xs">{TYPE_LABEL[question.type] || question.type}</Badge>
              <Badge variant="outline" className="text-xs">{points}/{question.points}pt</Badge>
            </div>
            <p className="text-sm font-medium">{question.content}</p>
          </div>
        </div>

        <div className="ml-8 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Your answer:</span> {formatAnswer(userAnswer, question.type)}</p>
          <p><span className="text-muted-foreground">Correct answer:</span> {formatAnswer(question.correctAnswer, question.type)}</p>
          {question.explanation && (
            <p className="text-muted-foreground mt-2 italic">{question.explanation}</p>
          )}
          {isCorrect === null && (
            <p className="text-yellow-600 text-xs mt-1">Needs manual review</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
