import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface TimeRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  comparisonMode: boolean;
  onComparisonModeChange: (enabled: boolean) => void;
  className?: string;
}

export type QuickFilter = 'last7' | 'last30' | 'last90' | 'last365' | 'all' | 'custom';

const getQuickFilterRange = (filter: QuickFilter): DateRange | null => {
  const now = endOfDay(new Date());

  switch (filter) {
    case 'last7':
      return { from: startOfDay(subDays(now, 7)), to: now };
    case 'last30':
      return { from: startOfDay(subDays(now, 30)), to: now };
    case 'last90':
      return { from: startOfDay(subDays(now, 90)), to: now };
    case 'last365':
      return { from: startOfDay(subYears(now, 1)), to: now };
    case 'all':
      return { from: startOfDay(subYears(now, 10)), to: now }; // 10 years back
    case 'custom':
      return null;
    default:
      return null;
  }
};

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
  comparisonMode,
  onComparisonModeChange,
  className
}) => {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('last30');
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  const handleQuickFilterChange = (filter: QuickFilter) => {
    setQuickFilter(filter);

    if (filter === 'custom') {
      setCustomRangeOpen(true);
      return;
    }

    const range = getQuickFilterRange(filter);
    if (range) {
      onChange(range);
    }
  };

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      });
      setCustomRangeOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {/* Quick Filters */}
      <Select value={quickFilter} onValueChange={(v) => handleQuickFilterChange(v as QuickFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sélectionner une période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7">7 derniers jours</SelectItem>
          <SelectItem value="last30">30 derniers jours</SelectItem>
          <SelectItem value="last90">90 derniers jours</SelectItem>
          <SelectItem value="last365">1 an</SelectItem>
          <SelectItem value="all">Toute la période</SelectItem>
          <SelectItem value="custom">Personnalisé</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      <Popover open={customRangeOpen} onOpenChange={setCustomRangeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd MMM yyyy', { locale: fr })} -{' '}
                  {format(value.to, 'dd MMM yyyy', { locale: fr })}
                </>
              ) : (
                format(value.from, 'dd MMM yyyy', { locale: fr })
              )
            ) : (
              <span>Choisir une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={{ from: value?.from, to: value?.to }}
            onSelect={handleCustomDateSelect}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>

      {/* Comparison Mode Toggle */}
      <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="comparison-mode" className="text-sm cursor-pointer">
          Comparer
        </Label>
        <Switch
          id="comparison-mode"
          checked={comparisonMode}
          onCheckedChange={onComparisonModeChange}
        />
      </div>
    </div>
  );
};

// Utility function to calculate comparison period
export const getComparisonPeriod = (range: DateRange): DateRange => {
  const duration = range.to.getTime() - range.from.getTime();
  const from = new Date(range.from.getTime() - duration);
  const to = new Date(range.to.getTime() - duration);

  return {
    from: startOfDay(from),
    to: endOfDay(to)
  };
};

// Utility function to calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Component for displaying metric with comparison
interface MetricComparisonProps {
  label: string;
  current: number;
  previous?: number;
  format?: (value: number) => string;
  showComparison?: boolean;
}

export const MetricComparison: React.FC<MetricComparisonProps> = ({
  label,
  current,
  previous,
  format = (v) => v.toString(),
  showComparison = true
}) => {
  const change = previous !== undefined ? calculatePercentageChange(current, previous) : null;
  const isPositive = change !== null && change >= 0;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{format(current)}</span>
        {showComparison && change !== null && (
          <span
            className={cn(
              "text-sm font-medium flex items-center",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      {showComparison && previous !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">
          vs {format(previous)} période précédente
        </p>
      )}
    </div>
  );
};
