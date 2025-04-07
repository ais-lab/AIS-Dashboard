import { useEffect, useRef } from "react"

interface Props<T> {
  value: T
  effect: (prev: T, next: T) => void
  skipNil?: boolean
}

const useValueChange = <T>(props: Props<T>) => {
  const { value, effect, skipNil } = props
  const latestValue = useRef(value)
  const callback = useRef(effect)
  callback.current = effect

  useEffect(() => {
    if (skipNil && value && !latestValue.current) {
      latestValue.current = value
      return
    }
    const prev = latestValue.current
    latestValue.current = value
    const isChanged = prev !== value
    if (!isChanged) return
    callback.current?.(prev, value)
  }, [skipNil, value])
}

export default useValueChange
