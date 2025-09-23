import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type TimeRangeKey =
  | "24h"
  | "7days"
  | "14days"
  | "1month"
  | "3months"
  | "6months"
  | "12months";

export const TIME_RANGE_LABELS: Record<TimeRangeKey, string> = {
  "24h": "24 h",
  "7days": "7 jours",
  "14days": "14 jours",
  "1month": "1 mois",
  "3months": "3 mois",
  "6months": "6 mois",
  "12months": "12 mois",
};

export function TimeRangePicker({
  value,
  onChange,
  className,
}: {
  value: TimeRangeKey;
  onChange: (val: TimeRangeKey) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimeRangeKey)}>
      <SelectTrigger className={cn("w-40", className)}>
        <SelectValue placeholder="Période" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TIME_RANGE_LABELS).map(([k, label]) => (
          <SelectItem key={k} value={k}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
