import { SingleChoice } from "./types/SingleChoice";
import { MultipleChoice } from "./types/MultipleChoice";
import { TrueFalse } from "./types/TrueFalse";
import { FillInBlank } from "./types/FillInBlank";
import { ShortAnswer } from "./types/ShortAnswer";
import { Matching } from "./types/Matching";

// AUDIT-SUGGESTION: The `question` prop and its associated `value` and `onChange` callbacks use `unknown`.
// This weakens type safety. A better approach is to define a discriminated union for all question types.
// This would allow `value` and `onChange` to be correctly typed based on the `question.type`
// (e.g., if type is 'SINGLE_CHOICE', `value` should be `string | null`).
interface Props {
  question: { id: string; type: string; content: string; options: string[] | null; correctAnswer: unknown; points: number };
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}

export function QuestionRenderer({ question, value, onChange, disabled }: Props) {
  switch (question.type) {
    case "SINGLE_CHOICE":
      return <SingleChoice question={question} value={value} onChange={onChange} disabled={disabled} />;
    case "MULTIPLE_CHOICE":
      return <MultipleChoice question={question} value={value} onChange={onChange} disabled={disabled} />;
    case "TRUE_FALSE":
      return <TrueFalse value={value} onChange={onChange} disabled={disabled} />;
    case "FILL_BLANK":
      return <FillInBlank value={value} onChange={onChange} disabled={disabled} />;
    case "SHORT_ANSWER":
      return <ShortAnswer value={value} onChange={onChange} disabled={disabled} />;
    case "MATCHING":
      return <Matching question={question} value={value} onChange={onChange as any} disabled={disabled} />;
    default:
      return <p className="text-sm text-muted-foreground">Unsupported question type: {question.type}</p>;
  }
}
