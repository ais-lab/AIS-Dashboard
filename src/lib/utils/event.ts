import dayjsConfig from "@/config/dayjs"

// An event stays on the board through the end of its day (local time), then drops off.
export const isEventOver = (date: string, now = new Date()): boolean => {
  const day = dayjsConfig(date)
  return day.isValid() && day.endOf("day").isBefore(now)
}
