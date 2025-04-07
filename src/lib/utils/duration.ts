const seconds = (duration: number) => duration * 1000

const minutes = (duration: number) => seconds(duration) * 60

const hours = (duration: number) => minutes(duration) * 60

const days = (duration: number) => hours(duration) * 24

const weeks = (duration: number) => days(duration) * 7

const months = (duration: number) => days(duration) * 30

const years = (duration: number) => days(duration) * 365

export const duration = {
  seconds,
  minutes,
  hours,
  days,
  weeks,
  months,
  years,
}
