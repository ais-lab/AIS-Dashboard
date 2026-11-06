import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { WeatherData } from "@/types/models"
import { duration } from "@/lib/utils/duration"

interface WeatherQueryParams {
  latitude: number
  longitude: number
}

const fetchWeatherData = async ({
  latitude,
  longitude,
}: WeatherQueryParams) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&timezone=Asia%2FTokyo`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch weather data")
  }

  return await response.json()
}

type WeatherQueryOptions = Omit<
  UseQueryOptions<WeatherData, Error>,
  "queryKey" | "queryFn"
> &
  WeatherQueryParams

export const useWeather = (options: WeatherQueryOptions) => {
  const { latitude, longitude, ...rest } = options
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => fetchWeatherData({ latitude, longitude }),
    ...rest,
    refetchInterval: duration.hours(3),
  })
}
