import path from "path"
import { useCallback } from "react"
import { DropzoneOptions, useDropzone } from "react-dropzone"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { getReadableFileSize } from "@/lib/utils/file"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Icons } from "./icons"

interface Props {
  files?: File[]
  onFilesChange?: (files: File[]) => void
  options?: Omit<DropzoneOptions, "onDrop">
  disabled?: boolean
}

const FileInput = ({ files = [], onFilesChange, options, disabled }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const handleOnDrop = (files: File[]) => {
        onFilesChange?.(files)
      }
      const handleAddMoreFiles = (newFiles: File[]) => {
        onFilesChange?.([...files, ...newFiles])
      }
      if (files.length === 0) {
        handleOnDrop(acceptedFiles)
      } else {
        handleAddMoreFiles(acceptedFiles)
      }
    },
    [files, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejectedFiles) => {
      toast.error(
        `Invalid file(s): ${rejectedFiles
          .map((file) => file.file.name)
          .join(", ")}`
      )
    },
    ...options,
  })

  const canUploadMoreFiles =
    !options?.maxFiles || files.length < options.maxFiles

  const fileDropZone = (
    <Card
      className={cn(
        "mt-0 flex min-h-16 cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-100 bg-neutral-25",
        isDragActive && "border-primary"
      )}
      {...getRootProps()}
    >
      <CardContent className="p-0 text-center text-xs">
        <input {...getInputProps()} />
        {isDragActive ? (
          <Icons.uploadCloud className="animate-bounce text-primary" />
        ) : (
          <>
            <p>Kéo và thả ảnh vào đây hoặc nhấn để chọn ảnh</p>
            <p className="text-muted-foreground">
              {`Hỗ trợ định dạng: (${Object.values(
                options?.accept || {}
              ).map((ext) => ext.join(", "))})`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      {files.length === 0 ? (
        fileDropZone
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto text-neutral-250">
          {canUploadMoreFiles && <div className="mb-8">{fileDropZone}</div>}
          {files.map((file) => {
            const extention = path.extname(file.name)
            return (
              <div key={file.name} className="flex items-center">
                <div className="border-600 flex w-[280px] items-center gap-2 rounded bg-neutral-700 px-4 py-2 text-sm md:w-[350px] lg:max-w-[400px]">
                  <Icons.fileText className="h-6 w-6" />
                  <div className="flex items-center">
                    <span className="ellipsis line-clamp-1 flex-grow break-all text-left">
                      {file.name.slice(0, -extention.length)}
                    </span>
                    <span>{path.extname(file.name)}</span>
                  </div>
                  <span className="w-fit text-nowrap">
                    | {getReadableFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="link"
                  className="ml-2 p-1 text-neutral-250"
                  onClick={() =>
                    onFilesChange?.(files.filter((f) => f.name !== file.name))
                  }
                >
                  <Icons.xCircle className="h-5 w-5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileInput
