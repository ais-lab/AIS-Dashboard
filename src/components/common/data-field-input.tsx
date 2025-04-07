import { forwardRef, useEffect, useRef, useState } from "react"
import _isNil from "lodash/isNil"

import { cn } from "@/lib/utils"

import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Icons } from "./icons"

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string
  extraLabel?: string
  unit?: string
  id?: string
  className?: string
  leadingClassName?: string
  labelClassName?: string
  initialValue?: number
  required?: boolean
  disabled?: boolean
  onChange?: (value?: number) => void
  showErrorMessage?: boolean
}

const MAX_DIGITS = 16

const DataFieldInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    className,
    label,
    extraLabel,
    id,
    initialValue,
    unit,
    onChange,
    disabled,
    showErrorMessage = true,
    ...rest
  } = props

  const trailingRef = useRef<HTMLDivElement>(null)

  const [rawValue, setRawValue] = useState<string>(
    initialValue !== undefined ? Intl.NumberFormat().format(initialValue) : ""
  )
  const [value, setValue] = useState<number | undefined>(initialValue)
  const shouldShowError =
    (_isNil(value) || isNaN(value)) && !disabled && showErrorMessage
  const isCurrency = unit === "currency"
  const hasUnit = unit && !isCurrency

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isEnterOrSubmit = e.key === "Enter" || e.key === "Submit"
    if (isEnterOrSubmit) {
      rest?.onKeyDown?.(e)
      return
    }
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "-",
      "Tab",
    ]
    const isCommand =
      e.metaKey || (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key))
    if (/^\d$/.test(e.key) || allowedKeys.includes(e.key) || isCommand) return
    e.preventDefault()
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value.replace(/,/g, "")
    if (targetValue.length > MAX_DIGITS) return
    if (["-", ""].includes(targetValue)) {
      setRawValue(targetValue)
      setValue(undefined)
      onChange?.(undefined)
      return
    }
    const numberValue = Number(targetValue)
    setValue(numberValue)
    setRawValue(
      !isNaN(numberValue) ? Intl.NumberFormat("en-US").format(numberValue) : ""
    )
    onChange?.(numberValue)
  }

  const handleOnBlur = () => {
    if (value === undefined || isNaN(value)) {
      setRawValue("")
    }
  }

  useEffect(() => {
    setRawValue(
      !_isNil(initialValue) ? Intl.NumberFormat().format(initialValue) : ""
    )
    setValue(initialValue)
  }, [initialValue])

  return (
    <>
      {label && (
        <Label htmlFor={id}>
          {label}
          {extraLabel && (
            <span className="text-muted-foreground">{` ${extraLabel}`}</span>
          )}
        </Label>
      )}
      <Input
        {...rest}
        disabled={disabled}
        value={rawValue}
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
        onChange={handleOnChange}
        id={id}
        ref={ref}
        className={cn(
          className,
          shouldShowError && "mb-1.5 border-destructive focus-visible:ring-0",
          isCurrency && "pl-11"
        )}
        style={{
          paddingRight:
            hasUnit && trailingRef.current?.clientWidth
              ? `${trailingRef.current.clientWidth + 16}px`
              : "",
        }}
        leading={
          isCurrency && (
            <>
              <span className="text-sm text-neutral-100">US$</span>
            </>
          )
        }
        trailing={
          (shouldShowError || hasUnit) && (
            <div className="flex w-fit items-center gap-2" ref={trailingRef}>
              {hasUnit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
              {shouldShowError && (
                <Icons.alertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          )
        }
      />
      {shouldShowError && (
        <Label className="text-destructive">Enter your data</Label>
      )}
    </>
  )
})

DataFieldInput.displayName = "DataFieldInput"

export default DataFieldInput
