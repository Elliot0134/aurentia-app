"use client"

import * as React from "react"
import { formatDateRange } from "little-date"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getEventTypeColor } from "@/lib/eventConstants"

interface Event {
  id?: string;
  title: string;
  from: string;
  to: string;
  type?: string;
}

interface CalendarWithEventsProps {
  events?: Event[];
  className?: string;
  onAddEvent?: () => void;
  onEventClick?: (eventId: string) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export function CalendarWithEvents({ events = [], className, onAddEvent, onEventClick, selectedDate, onDateSelect }: CalendarWithEventsProps) {
  const [date, setDate] = React.useState<Date | undefined>(selectedDate || new Date())
  const [hasUserSelectedDate, setHasUserSelectedDate] = React.useState(false)
  const today = new Date()
  const isTodaySelected = date?.toDateString() === today.toDateString()

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setHasUserSelectedDate(true)
      onDateSelect?.(selectedDate)
    }
  }

  // Sync with external selectedDate prop
  React.useEffect(() => {
    if (selectedDate && selectedDate.toDateString() !== date?.toDateString()) {
      setDate(selectedDate)
    }
  }, [selectedDate, date])

  return (
    <Card className={`w-fit py-4 ${className || ''}`}>
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="bg-transparent p-0"
          classNames={{
            day_today: isTodaySelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground",
          }}
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t px-4 !pt-2">
        <div className="flex w-full items-center justify-between px-1">
          <div className="text-sm font-medium">
            {date?.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Ajouter un événement"
            onClick={onAddEvent}
          >
            <PlusIcon />
            <span className="sr-only">Ajouter un événement</span>
          </Button>
        </div>
        <div className="flex w-full flex-col gap-2">
          {events.length === 0 && hasUserSelectedDate ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Il n'y a pas d'événements pour cette date
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Cliquez sur un événement pour afficher les détails
            </div>
          ) : (
            events.map((event) => {
              const eventColor = event.type ? getEventTypeColor(event.type as any) : undefined;
              return (
                <div
                  key={event.id || event.title}
                  className="bg-muted relative rounded-md p-2 text-sm hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => event.id && onEventClick?.(event.id)}
                >
                  <div 
                    className="font-medium"
                    style={eventColor ? { 
                      borderLeft: `3px solid ${eventColor}`,
                      paddingLeft: '18px'
                    } : { paddingLeft: '18px' }}
                  >
                    {event.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDateRange(new Date(event.from), new Date(event.to))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardFooter>
    </Card>
  )
}