import { useWeather } from "@/apis/gdrive/use-weather"
import { openWeatherWMOToEmoji } from "@akaguny/open-meteo-wmo-to-emoji"

import dayjsConfig from "@/config/dayjs"
import { Badge } from "@/components/ui/badge"

interface Props {
  latitude: number
  longitude: number
}

const WeatherBadge = ({ latitude, longitude }: Props) => {
  const { data, isLoading } = useWeather({ latitude, longitude })

  if (isLoading || !data) {
    return null
  }

  const currentHour = new Date().getHours()
  const dayLabel = dayjsConfig(new Date(data.hourly.time[currentHour])).format(
    "ddd DD"
  )
  const dayLabelJa = dayjsConfig(new Date(data.hourly.time[currentHour]))
    .locale("ja")
    .format("ddd DD")
  const emoji = openWeatherWMOToEmoji(
    data.hourly.weather_code[currentHour]
  ).value

  const temperature = Math.round(data.hourly.temperature_2m[currentHour])

  return (
    <Badge className="fixed left-1/2 top-2 z-10 flex -translate-x-1/2 transform items-center gap-2 rounded-md bg-neutral-600 text-sm">
      {dayLabel} / {dayLabelJa}
      <span>
        {emoji} {temperature}°C
      </span>
    </Badge>
  )
}

export default WeatherBadge
