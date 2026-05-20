export interface BaseDisplayItem {
  from: string
  name: string
  id: string
  to: string
  type: "event" | "image" | "text" | "folder"
  weight?: number
  displaySeconds?: number
}

export interface FolderItem extends BaseDisplayItem {
  items: BaseDisplayItem[]
}

export interface CountdownEvent {
  name: string
  date: string
  address?: string
  note?: string
  description?: string
}

export interface HourlyUnits {
  time: string
  temperature_2m: string
  precipitation_probability: string
  weather_code: string
}

export interface Hourly {
  time: string[]
  temperature_2m: number[]
  precipitation_probability: number[]
  weather_code: number[]
}

export interface WeatherData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  hourly_units: HourlyUnits
  hourly: Hourly
}

export const runDurations = [
  "1-month",
  "3-month",
  // "6-month",
  "12-month",
  "36-month",
  "forever",
] as const

export type RunDuration = (typeof runDurations)[number]

export const runDurationLabels = {
  "1-month": {
    label: "1 tháng (4.000 đ)",
    labelNoPrice: "1 tháng",
    timeLength: 30 * 24 * 60 * 60 * 1000,
  },
  "3-month": {
    label: "3 tháng (12.000 đ)",
    labelNoPrice: "3 tháng",
    timeLength: 3 * 30 * 24 * 60 * 60 * 1000,
  },
  "6-month": {
    label: "6 tháng (25.000 đ)",
    labelNoPrice: "6 tháng",
    timeLength: 6 * 30 * 24 * 60 * 60 * 1000,
  },
  "12-month": {
    label: "12 tháng (30.000 đ)",
    labelNoPrice: "12 tháng",
    timeLength: 12 * 30 * 24 * 60 * 60 * 1000,
  },
  "36-month": {
    label: "36 tháng (55.000 đ)",
    labelNoPrice: "36 tháng",
    timeLength: 36 * 30 * 24 * 60 * 60 * 1000,
  },
  forever: {
    label: "Vĩnh viễn (100.000 đ)",
    labelNoPrice: "Vĩnh viễn",
    timeLength: Infinity,
  },
} as Record<
  RunDuration,
  { label: string; timeLength: number; labelNoPrice: string }
>

export interface AppUser {
  id: string
  updatedAt: string
  createdAt: string
  balance: number
  orders: Order[]
  accounts: Record<string, Account>
  transactions: Transaction[]
  paymentCode: string
  refCode?: string
  affiliate?: string
  countGhep?: number
}

export interface Account {
  id: string
  lastRun: string
  nextRun: string
  runCount: number
  status: string
  duration: RunDuration
  createdAt: string
  errorMessages?: string
  expiredAt?: string
  errorMsg?: string
}

export interface Transaction {
  id: number
  amount: number
  createdAt: string
  description: string
  status: string
}

export interface RefCode {
  id: string
  message: string
  reward: number
  comission: number
  balance?: number
  usedBy?: string[]
}

export interface Order {
  id: string
  createdAt: string
  userId: string
  imageCount: number
  username: string
  overallImageUrl: string
  changeNameCardCount?: number
  accountCode?: string
  topHeroImageUrls?: string[]
  winRateImageUrls?: string[]
  evoSkin?: {
    wukong?: string
    valhein?: string
    nakroth?: string
  }
  resultUrl: string
  status?: string
  imageCost: number
}
