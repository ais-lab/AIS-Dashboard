import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { debounce } from "lodash"

interface AnimateChangeInHeightProps {
  children: React.ReactNode
}

export const AnimatedHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
}) => {
  const resizeOptimzationRef = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | "auto">("auto")

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        // We only have one entry, so we can use entries[0].
        const observedHeight = entries[0].contentRect.height
        setHeight(observedHeight)
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        // Cleanup the observer when the component is unmounted
        resizeObserver.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const debouncedResize = debounce(() => {
      resizeOptimzationRef.current = false
    }, 40)
    const handleResize = () => {
      resizeOptimzationRef.current = true
      debouncedResize()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <motion.div
      style={{ height }}
      animate={{ height }}
      transition={{
        duration: resizeOptimzationRef.current ? 0 : 0.15,
        ease: "easeInOut",
      }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  )
}
