import dayjs from "dayjs"
import advanced from "dayjs/plugin/advancedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import updateLocate from "dayjs/plugin/updateLocale"
import utc from "dayjs/plugin/utc"
import weekday from "dayjs/plugin/weekday"

import "dayjs/locale/ja" // Japanese locale

dayjs.extend(advanced)
dayjs.extend(customParseFormat)
dayjs.extend(weekday)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const thresholds = [
  { l: "s", r: 1 },
  { l: "ss", r: 59, d: "second" },
  { l: "m", r: 1 },
  { l: "mm", r: 59, d: "minute" },
  { l: "h", r: 1 },
  { l: "hh", r: 23, d: "hour" },
  { l: "d", r: 1 },
  { l: "dd", r: 21, d: "day" },
  { l: "M", r: 1 },
  { l: "MM", r: 11, d: "month" },
  { l: "y", r: 1 },
  { l: "yy", d: "year" },
]

const config = {
  thresholds: thresholds,
}
dayjs.extend(relativeTime, config)

dayjs.extend(updateLocate)

export const DAYJS_CONSTANT_DEFAULT = {
  timezone: dayjs.tz.guess(),
  dateFormat: "DD/MM/YYYY",
  dateFormatUS: "MM/DD/YYYY",
  readableDateFormat: "MMM DD, YYYY",
  fullDateFormat: "HH:mm - DD MMMM, YYYY",
  timestampFormat: "DD/MM/YYYY HH:mm",
}

const dayjsConfig = Object.assign(dayjs, {
  view(
    date?: number | string | Date,
    format: string = DAYJS_CONSTANT_DEFAULT.dateFormat
  ) {
    if (!date) return undefined

    return dayjs(date).format(format)
  },
  tzView({
    date,
    format = DAYJS_CONSTANT_DEFAULT.timestampFormat,
    isDisplayToday = false,
    isRelative = false,
  }: {
    date?: number | string | Date
    format?: string
    isDisplayToday?: boolean
    isRelative?: boolean
  }) {
    if (!date) return undefined

    const timestampTz = dayjs(date).tz()
    const currentDate = dayjs(new Date()).tz()

    if (isRelative) {
      return timestampTz.fromNow()
    }

    const isToday = timestampTz.isSame(currentDate, "day")

    if (isDisplayToday && isToday) {
      return `Today, ${timestampTz.format("HH:mm")}`
    }

    const yesterday = currentDate.subtract(1, "day").startOf("day")
    const isYesterday = timestampTz.isSame(yesterday, "day")

    if (isDisplayToday && isYesterday) {
      return `Yesterday, ${timestampTz.format("HH:mm")}`
    }

    return timestampTz.format(format)
  },
  setTimezoneDefault(timezone: string = DAYJS_CONSTANT_DEFAULT.timezone) {
    dayjs.tz.setDefault(timezone)
  },
})

export default dayjsConfig
