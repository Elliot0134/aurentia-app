import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePickerProps {
  value: string; // Format: "HH:mm"
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, placeholder = "Sélectionner", disabled = false }: TimePickerProps) {
  // Parse current value
  const [hours, minutes] = value ? value.split(':') : ['', ''];

  // Generate hours (00-23) and all minutes (00-59)
  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleHourChange = (newHour: string) => {
    const newMinutes = minutes || '00';
    onChange(`${newHour}:${newMinutes}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const newHour = hours || '00';
    onChange(`${newHour}:${newMinute}`);
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Hour selector */}
      <div className="flex-1">
        <Select value={hours} onValueChange={handleHourChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-lg font-medium text-gray-500">:</span>

      {/* Minute selector */}
      <div className="flex-1">
        <Select value={minutes} onValueChange={handleMinuteChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="mm" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
