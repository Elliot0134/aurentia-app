import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LucideIcon } from 'lucide-react';

export const TIME_RANGE_LABELS = {
  "24h": "24 heures",
  "48h": "48 heures",
  "7days": "7 jours",
  "14days": "14 jours", 
  "1month": "1 mois",
  "3months": "3 mois",
  "6months": "6 mois",
  "12months": "12 mois",
  "all": "Depuis le début"
} as const;

export type TimeRangeKey = keyof typeof TIME_RANGE_LABELS;

interface TimeRangePickerProps {
  value: TimeRangeKey;
  onChange: (value: TimeRangeKey) => void;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TIME_RANGE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'default'
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'orange': return 'text-orange-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendColor = (positive: boolean) => {
    return positive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${getColorClass(color)}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${getTrendColor(trend.positive ?? true)}`}>
            {trend.positive !== false ? '+' : ''}{trend.value} {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface ProgressMetricProps {
  title: string;
  value: number;
  color?: string;
  showPercentage?: boolean;
}

export const ProgressMetric: React.FC<ProgressMetricProps> = ({
  title,
  value,
  color = '#ff5932',
  showPercentage = true
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{title}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{clampedValue.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};