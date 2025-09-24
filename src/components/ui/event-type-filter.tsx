import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Event } from "@/services/organisationService";
import { getEventTypeLabel, EVENT_TYPE_OPTIONS } from "@/lib/eventConstants";
import { Settings, Filter, Eye, EyeOff } from "lucide-react";

interface EventTypeFilterProps {
  eventTypeColors: Record<Event['type'], string>;
  visibleTypes: Set<Event['type']>;
  onVisibilityChange: (type: Event['type'], visible: boolean) => void;
  onColorChange?: (type: Event['type'], color: string) => void;
  showColorPicker?: boolean;
}

export function EventTypeFilter({ 
  eventTypeColors, 
  visibleTypes, 
  onVisibilityChange,
  onColorChange,
  showColorPicker = false
}: EventTypeFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggleAll = (visible: boolean) => {
    EVENT_TYPE_OPTIONS.forEach(option => {
      onVisibilityChange(option.value as Event['type'], visible);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Badges des types masqués */}
      <div className="flex flex-wrap gap-1">
        {EVENT_TYPE_OPTIONS
          .filter(option => !visibleTypes.has(option.value as Event['type']))
          .map(option => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: eventTypeColors[option.value as Event['type']] + '20',
                color: eventTypeColors[option.value as Event['type']],
                border: `1px solid ${eventTypeColors[option.value as Event['type']]}30`
              }}
              onClick={() => onVisibilityChange(option.value as Event['type'], true)}
            >
              {option.label}
              <EyeOff className="w-3 h-3 ml-1" />
            </Badge>
          ))}
      </div>

      {/* Dropdown pour filtrer */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrer ({visibleTypes.size}/{EVENT_TYPE_OPTIONS.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Types d'événements
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Options pour tout afficher/masquer */}
          <DropdownMenuItem
            onClick={() => handleToggleAll(true)}
            className="font-medium cursor-pointer"
          >
            <Eye className="w-4 h-4 mr-2" />
            Tout afficher
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleToggleAll(false)}
            className="font-medium cursor-pointer"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Tout masquer
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Liste des types d'événements */}
          {EVENT_TYPE_OPTIONS.map(option => {
            const isVisible = visibleTypes.has(option.value as Event['type']);
            const color = eventTypeColors[option.value as Event['type']];
            
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isVisible}
                onCheckedChange={(checked) => 
                  onVisibilityChange(option.value as Event['type'], !!checked)
                }
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span>{option.label}</span>
                </div>
                {showColorPicker && onColorChange && (
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(option.value as Event['type'], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-6 h-6 rounded border-none cursor-pointer"
                  />
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}