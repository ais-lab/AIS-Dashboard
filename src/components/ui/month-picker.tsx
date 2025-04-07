import * as React from "react"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isToday from "dayjs/plugin/isToday"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "./button"

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isToday)
dayjs.extend(customParseFormat)

function getStartOfCurrentMonth() {
  return dayjs().startOf("month")
}

interface MonthPickerProps {
  currentMonth?: Date
  onMonthChange?: (newMonth: Date) => void
  disabledMonths?: Date[]
}

export default function MonthPicker({
  currentMonth,
  onMonthChange,
  disabledMonths = [],
}: MonthPickerProps) {
  const [currentYear, setCurrentYear] = React.useState(
    dayjs(currentMonth).format("YYYY")
  )
  const firstDayCurrentYear = dayjs(currentYear, "YYYY")

  const months = Array.from({ length: 12 }, (_, i) =>
    firstDayCurrentYear.month(i)
  )

  function previousYear() {
    const firstDayPreviousYear = firstDayCurrentYear.subtract(1, "year")
    setCurrentYear(firstDayPreviousYear.format("YYYY"))
  }

  function nextYear() {
    const firstDayNextYear = firstDayCurrentYear.add(1, "year")
    setCurrentYear(firstDayNextYear.format("YYYY"))
  }

  return (
    <div className="p-3">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="space-y-4">
          <div className="relative flex items-center justify-center pt-1">
            <div
              className="text-sm font-medium"
              aria-live="polite"
              role="presentation"
              id="month-picker"
            >
              {firstDayCurrentYear.format("YYYY")}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                name="previous-year"
                aria-label="Go to previous year"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "absolute left-1"
                )}
                type="button"
                onClick={previousYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                name="next-year"
                aria-label="Go to next year"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "absolute right-1"
                )}
                type="button"
                disabled={dayjs().isBefore(firstDayCurrentYear.add(1, "year"))}
                onClick={nextYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className="grid w-full grid-cols-3 gap-2"
            role="grid"
            aria-labelledby="month-picker"
          >
            {months.map((month) => {
              const isDisabled = disabledMonths.some((disabledMonth) =>
                month.isSame(disabledMonth, "month")
              )
              return (
                <div
                  key={month.toString()}
                  className="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md dark:[&:has([aria-selected])]:bg-slate-800"
                  role="presentation"
                >
                  <Button
                    name="day"
                    className={cn(
                      "h-8 w-fit font-normal",
                      month.isSame(currentMonth, "month") && "bg-accent",
                      !month.isSame(currentMonth, "month") &&
                        month.isSame(getStartOfCurrentMonth(), "month") &&
                        ""
                    )}
                    disabled={isDisabled || dayjs().isBefore(month)}
                    role="gridcell"
                    variant="ghost"
                    tabIndex={-1}
                    type="button"
                    onClick={() =>
                      !isDisabled && onMonthChange?.(month.toDate())
                    }
                  >
                    <time dateTime={month.format("YYYY-MM-DD")}>
                      {month.format("MMM")}
                    </time>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
