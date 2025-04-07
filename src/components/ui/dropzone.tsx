import React, { ChangeEvent, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface DropzoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  classNameWrapper?: string
  className?: string
  dropMessage: string
  handleOnDrop: (acceptedFiles: FileList | null) => void
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    { className, classNameWrapper, dropMessage, handleOnDrop, ...props },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)
    // Function to handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      handleOnDrop(null)
    }

    // Function to handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const { files } = e.dataTransfer
      if (inputRef.current) {
        inputRef.current.files = files
        handleOnDrop(files)
      }
    }

    // Function to simulate a click on the file input element
    const handleButtonClick = () => {
      if (inputRef.current) {
        inputRef.current.click()
      }
    }
    return (
      <Card
        ref={ref}
        className={cn(
          `hover:border-muted-foreground/50 border-2 border-dashed bg-muted hover:cursor-pointer`,
          classNameWrapper,
          isDragging ? "border-primary" : ""
        )}
      >
        <CardContent
          className={`flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs ${className}`}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="flex items-center justify-center text-muted-foreground">
            <span className="pointer-events-none font-medium">
              {dropMessage} {props.accept && ` (${props.accept})`}
            </span>

            <Input
              {...props}
              value={undefined}
              ref={inputRef}
              type="file"
              className={cn("hidden", className)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleOnDrop(e.target.files)
              }
            />
          </div>
        </CardContent>
      </Card>
    )
  }
)

Dropzone.displayName = "Dropzone"

export default Dropzone
