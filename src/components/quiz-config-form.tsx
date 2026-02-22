"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_BLANK", label: "Fill in Blank" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "MATCHING", label: "Matching" },
] as const;

interface QuizConfigFormProps {
  materialId: string;
  onSuccess: () => void;
}

export function QuizConfigForm({ materialId, onSuccess }: QuizConfigFormProps) {
  const [count, setCount] = useState(10);
  const [types, setTypes] = useState<string[]>(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);

  const toggleType = (val: string) => {
    setTypes((prev) => prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]);
  };

  const handleSubmit = async () => {
    if (types.length === 0) { toast.error("Select at least one question type"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, questionCount: count, questionTypes: types, difficulty }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed");
      toast.success("Quiz generation started");
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Number of Questions: {count}</Label>
        <Slider value={[count]} onValueChange={([v]) => setCount(v)} min={5} max={30} step={1} />
      </div>

      <div className="space-y-2">
        <Label>Question Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_TYPES.map((qt) => (
            <label key={qt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={types.includes(qt.value)} onCheckedChange={() => toggleType(qt.value)} />
              {qt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Difficulty</Label>
        <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex gap-4">
          {["EASY", "MEDIUM", "HARD"].map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value={d} />
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </label>
          ))}
        </RadioGroup>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Generating..." : "Generate Quiz"}
      </Button>
    </div>
  );
}
