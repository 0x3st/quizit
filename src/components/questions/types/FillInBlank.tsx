import { Input } from "@/components/ui/input";

interface Props {
  value: unknown;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function FillInBlank({ value, onChange, disabled }: Props) {
  return (
    <Input
      placeholder="Type your answer..."
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="max-w-md"
    />
  );
}
