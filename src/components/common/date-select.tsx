import { useEffect, useState } from "react"

import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

import _isNil from "lodash/isNil"

interface Props {
  value?: string
  onChange?: (value: string) => void
}

const dateParts = [
  {
    placeholder: "giờ",
    name: "hour",
    items: () => Array.from({ length: 24 }, (_, i) => i),
  },
  {
    placeholder: "phút",
    name: "minute",
    items: () => Array.from({ length: 60 }, (_, i) => i),
  },
] as const

export const TimeSelect: React.FC<Props> = ({ value, onChange }) => {
  const [hour, minute] = value?.split(":").map((v) => parseInt(v)) || []
  const [date, setDate] = useState<{
    hour?: number
    minute?: number
  }>({
    hour,
    minute,
  })

  useEffect(() => {
    if (!onChange) return
    if (_isNil(date.hour) || _isNil(date.minute)) return
    onChange(`${date.hour}:${date.minute}`)
  }, [date, onChange])

  const handleChange = (part: string, value?: string) => {
    if (!value) return
    setDate((prev) => ({
      ...prev,
      [part]: parseInt(value),
    }))
  }

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDate({
      hour: undefined,
      minute: undefined,
    })
  }

  return (
    <>
      <div className="flex gap-3">
        {dateParts.map((part) => {
          return (
            <Select
              key={part.name}
              onValueChange={(value) => handleChange(part.name, value)}
              value={date[part.name]?.toString() || ""}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={part.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {part.items().map((value) => (
                  <SelectItem
                    key={value}
                    className="py-1"
                    value={value.toString()}
                  >
                    {value.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
      </div>
      {(!_isNil(date.hour) || !_isNil(date.minute)) && (
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="link"
            size="xs"
            className="px-0"
            onClick={handleClear}
          >
            Xoá thời gian chạy
          </Button>
        </div>
      )}
    </>
  )
}
