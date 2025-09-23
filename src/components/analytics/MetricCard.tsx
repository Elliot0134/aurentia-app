import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "purple" | "orange" | "red" | "yellow";
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
  } as const;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.value > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <Activity className="h-3 w-3 text-gray-500 mr-1" />
            )}
            <span className={`text-xs ${trend.value > 0 ? "text-green-600" : "text-gray-600"}`}>
              {trend.value > 0 ? "+" : ""}
              {trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
