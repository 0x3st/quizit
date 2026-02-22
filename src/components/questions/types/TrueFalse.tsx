import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  value: unknown;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function TrueFalse({ value, onChange, disabled }: Props) {
  return (
    <RadioGroup value={(value as string) || ""} onValueChange={onChange} disabled={disabled}>
      {["True", "False"].map((opt) => (
        <label key={opt} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary">
          <RadioGroupItem value={opt} id={`tf-${opt}`} />
          <Label htmlFor={`tf-${opt}`} className="cursor-pointer flex-1">{opt}</Label>
        </label>
      ))}
    </RadioGroup>
  );
}
