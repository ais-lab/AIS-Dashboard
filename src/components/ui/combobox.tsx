"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { ScrollArea } from "./scroll-area"

export type ComboboxOptions = {
  value: string
  label: string
}

type Mode = "single" | "multiple"

interface ComboboxProps {
  mode?: Mode
  options: ComboboxOptions[]
  selected: string | string[]
  className?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (event: string | string[]) => void
  onCreate?: (value: string) => void
}

export function Combobox({
  options,
  selected,
  className,
  placeholder,
  mode = "single",
  disabled,
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>("")

  return (
    <div
      className={cn(
        "block",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            key={"combobox-trigger"}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between hover:bg-accent",
              disabled && "pointer-events-none"
            )}
          >
            {selected && selected.length > 0 ? (
              <div className="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
                <span>
                  {mode === "multiple" && Array.isArray(selected)
                    ? selected
                        .map(
                          (selectedValue: string) =>
                            options.find((item) => item.value === selectedValue)
                              ?.label
                        )
                        .join(", ")
                    : mode === "single" &&
                      options.find((item) => item.value === selected)?.label}
                </span>
              </div>
            ) : (
              placeholder ?? "Select Item..."
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder={placeholder ?? "Cari Item..."}
              value={query}
              onValueChange={(value: string) => setQuery(value)}
            />
            <CommandEmpty>Empty.</CommandEmpty>
            <ScrollArea className="max-h-80 min-h-10 overflow-auto">
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.label}
                    value={option.label}
                    onSelect={(currentValue) => {
                      setOpen(false)
                      if (!onChange) return
                      if (mode === "multiple" && Array.isArray(selected)) {
                        onChange(
                          selected.includes(option.value)
                            ? selected.filter((item) => item !== option.value)
                            : [...selected, option.value]
                        )
                      } else {
                        onChange(option.value)
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (mode === "multiple" &&
                          selected.includes(option.value)) ||
                          selected === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
