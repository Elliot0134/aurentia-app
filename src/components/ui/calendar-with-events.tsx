"use client"

import * as React from "react"
import { formatDateRange } from "little-date"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Event {
  title: string;
  from: string;
  to: string;
}

interface CalendarWithEventsProps {
  events?: Event[];
  className?: string;
  onAddEvent?: () => void;
}

export function CalendarWithEvents({ events = [], className, onAddEvent }: CalendarWithEventsProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [hasUserSelectedDate, setHasUserSelectedDate] = React.useState(false)
  const today = new Date()
  const isTodaySelected = date?.toDateString() === today.toDateString()

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setHasUserSelectedDate(true)
  }

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
            events.map((event) => (
              <div
                key={event.title}
                className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-muted-foreground text-xs">
                  {formatDateRange(new Date(event.from), new Date(event.to))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardFooter>
    </Card>
  )
}