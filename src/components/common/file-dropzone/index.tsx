import path from "path"
import { useCallback, useEffect, useState } from "react"
import { DropzoneOptions, useDropzone } from "react-dropzone"
import { PhotoProvider } from "react-photo-view"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "../../ui/card"
import { Icons } from "../icons"
import FileItem from "./file-item"

interface Props {
  onUpload?: (files: File[]) => void
  onUploadSuccess?: (file: File, url: string) => void
  onError?: (file: File, error?: Error) => void
  onRemove?: (file: File, url?: string) => void
  options?: Omit<DropzoneOptions, "onDrop">
  disabled?: boolean
  metaData?: Record<string, any>
  clearAllFunctionRef?: React.MutableRefObject<(() => void) | undefined>
}

const FileDropzone = ({
  options,
  disabled,
  onRemove,
  onUpload,
  onError,
  onUploadSuccess,
  metaData,
  clearAllFunctionRef,
}: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [existingFileNames, setExistingFileNames] = useState<
    Record<string, number>
  >({})

  const handleRemove = (file: File, filrUrl?: string) => {
    setFiles(files.filter((f) => f !== file))
    setExistingFileNames((prev) => {
      const baseName = file.name
        .slice(0, -path.extname(file.name).length)
        .replace(/\s\(\d+\)$/, "")
      const existingFileCount = prev[baseName] || 0
      if (existingFileCount > 1) {
        return {
          ...prev,
          [baseName]: existingFileCount - 1,
        }
      }
      const { [baseName]: _, ...rest } = prev
      return rest
    })
    onRemove?.(file, filrUrl)
  }

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const handleOnDrop = (files: File[]) => {
        setFiles(files)
      }
      const handleAddMoreFiles = (newFiles: File[]) => {
        setFiles([...files, ...newFiles])
      }

      const newFiles = acceptedFiles.map((file) => {
        const fileName = file.name
        const extension = path.extname(fileName)
        const baseName = fileName.slice(0, -extension.length)
        const existingFileCount = existingFileNames[baseName] || 0
        setExistingFileNames((prev) => ({
          ...prev,
          [baseName]: existingFileCount + 1,
        }))
        const newFileName =
          existingFileCount > 0
            ? `${baseName} (${existingFileCount})${extension}`
            : fileName
        return new File([file], newFileName, { type: file.type })
      })

      if (files.length === 0) {
        handleOnDrop(newFiles)
      } else {
        handleAddMoreFiles(newFiles)
      }
      onUpload?.(newFiles)
    },
    [files, onUpload, existingFileNames]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: (rejectedFiles) => {
      const rejectedFileNumbers = rejectedFiles.length
      const isUploadLimitExceeded =
        options?.maxFiles && rejectedFileNumbers > options.maxFiles
      if (isUploadLimitExceeded) {
        toast.error(
          `Please upload a maximum of ${options.maxFiles} files at a time`
        )
        return
      }
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
        "mt-0 flex min-h-16 cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-150 bg-neutral-25",
        isDragActive && "border-primary"
      )}
      {...getRootProps()}
    >
      <CardContent className="grid gap-1 p-0 text-center text-xs">
        <input {...getInputProps()} />
        {isDragActive ? (
          <Icons.uploadCloud className="animate-bounce text-primary" />
        ) : (
          <>
            <p>
              Kéo và thả ảnh vào đây hoặc nhấn để{" "}
              <span className="underline">chọn ảnh</span>
            </p>

            <p className="text-muted-foreground">
              {`Hỗ trợ định dạng: (${Object.values(options?.accept || {}).map(
                (ext) => ext.join(", ")
              )})`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )

  useEffect(() => {
    if (clearAllFunctionRef) {
      clearAllFunctionRef.current = () => {
        setFiles([])
        setExistingFileNames({})
      }
    }
  }, [clearAllFunctionRef])

  return (
    <PhotoProvider maskOpacity={0.75}>
      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        {files.length === 0 ? (
          fileDropZone
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {canUploadMoreFiles && <div className="mb-2">{fileDropZone}</div>}
            {files.map((file) => {
              return (
                <FileItem
                  key={file.name}
                  file={file}
                  onUploadSuccess={(url) => onUploadSuccess?.(file, url)}
                  onRemove={(url) => handleRemove(file, url)}
                  onError={(error) => onError?.(file, error)}
                  metaData={metaData}
                  disabled={disabled}
                />
              )
            })}
          </div>
        )}
      </div>
    </PhotoProvider>
  )
}

export default FileDropzone
