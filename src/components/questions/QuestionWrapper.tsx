import { Badge } from "@/components/ui/badge";

interface QuestionWrapperProps {
  number: number;
  content: string;
  points: number;
  type: string;
  children: React.ReactNode;
}

const TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill Blank",
  SHORT_ANSWER: "Short Answer",
  MATCHING: "Matching",
};

export function QuestionWrapper({ number, content, points, type, children }: QuestionWrapperProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Question {number}</span>
          <Badge variant="outline" className="text-xs">{TYPE_LABEL[type] || type}</Badge>
          <Badge variant="outline" className="text-xs">{points}pt</Badge>
        </div>
        <p className="text-base font-medium">{content}</p>
      </div>
      {children}
    </div>
  );
}
