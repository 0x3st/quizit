import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  question: { options: string[] | null; correctAnswer: unknown };
  value: unknown;
  onChange: (v: Record<string, string>) => void;
  disabled?: boolean;
}

export function Matching({ question, value, onChange, disabled }: Props) {
  const rightOptions = question.options || [];
  const correctAnswer = question.correctAnswer as Record<string, string>;
  const leftItems = Object.keys(correctAnswer || {});
  const current = (value as Record<string, string>) || {};

  const handleChange = (left: string, right: string) => {
    onChange({ ...current, [left]: right });
  };

  return (
    <div className="space-y-3">
      {leftItems.map((left) => (
        <div key={left} className="flex items-center gap-4">
          <span className="text-sm font-medium min-w-[120px]">{left}</span>
          <Select value={current[left] || ""} onValueChange={(v) => handleChange(left, v)} disabled={disabled}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select match..." />
            </SelectTrigger>
            <SelectContent>
              {rightOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
