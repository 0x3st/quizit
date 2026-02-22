import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: unknown;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function ShortAnswer({ value, onChange, disabled }: Props) {
  return (
    <Textarea
      placeholder="Write your answer..."
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={4}
      className="max-w-lg"
    />
  );
}
