export function ProgressMetric({
  title,
  value,
  max = 100,
  color = "#8884d8",
}: {
  title: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
