import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  question: { options: string[] | null };
  value: unknown;
  onChange: (v: string[]) => void;
  disabled?: boolean;
}

export function MultipleChoice({ question, value, onChange, disabled }: Props) {
  const options = question.options || [];
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
          <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} disabled={disabled} />
          <Label className="cursor-pointer flex-1">{String.fromCharCode(65 + i)}. {opt}</Label>
        </label>
      ))}
    </div>
  );
}
