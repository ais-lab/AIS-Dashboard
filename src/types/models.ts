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
