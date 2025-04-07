import { cn } from "@/lib/utils"

interface Props {
  size?: "mini" | "small" | "medium" | "large"
  className?: string
}

const IosLoadingSpinner: React.FC<Props> = ({ size = "small", className }) => {
  const sizeMap = {
    mini: "h-4 w-4",
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-14 w-14",
  }
  const barSizeMap = {
    mini: "h-4 w-0.5",
    small: "h-6 w-0.5",
    medium: "h-10 w-[3px]",
    large: "h-14 w-1",
  }

  const barClasses = Array.from({ length: 8 }).map((_, index) =>
    cn("absolute rounded left-[50%]", barSizeMap[size])
  )

  return (
    <div className={cn("relative inline-block", sizeMap[size], className)}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={barClasses[index]}
          style={{
            transform: `rotate(${index * 45}deg)`,
          }}
        >
          <div
            className="h-[28%] w-full animate-fade rounded bg-neutral-100"
            style={{
              animationDelay: `${index * 0.125}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default IosLoadingSpinner
