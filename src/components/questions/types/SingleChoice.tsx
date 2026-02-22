import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  question: { options: string[] | null };
  value: unknown;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function SingleChoice({ question, value, onChange, disabled }: Props) {
  const options = question.options || [];
  return (
    <RadioGroup value={(value as string) || ""} onValueChange={onChange} disabled={disabled}>
      {options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary">
          <RadioGroupItem value={opt} id={`opt-${i}`} />
          <Label htmlFor={`opt-${i}`} className="cursor-pointer flex-1">{String.fromCharCode(65 + i)}. {opt}</Label>
        </label>
      ))}
    </RadioGroup>
  );
}
