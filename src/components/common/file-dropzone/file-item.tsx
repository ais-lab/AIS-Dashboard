import path from "path"
import { useEffect, useRef, useState } from "react"
import useDeleteFile from "@/apis/files/use-delete-file"
import useUploadFile from "@/apis/files/use-upload-file"
import { PhotoView } from "react-photo-view"

import { getReadableFileSize } from "@/lib/utils/file"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import ConfirmDialog from "../confirm-dialog"
import { Icons } from "../icons"
import { UploadTask } from "firebase/storage"

interface Props {
  file: File
  onUploadSuccess?: (url: string) => void
  onError?: (error: Error) => void
  onRemove?: (url?: string) => void
  metaData?: Record<string, any>
  disabled?: boolean
}

const FileItem = (props: Props) => {
  const { file, onUploadSuccess, onError, onRemove, disabled, metaData } = props
  const extension = path.extname(file.name)

  const abortController = useRef(new AbortController())
  const uploadTaskRef = useRef<UploadTask | undefined>(undefined)

  const [transferredBytes, setTransferredBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const {
    mutate: uploadFile,
    isPending,
    isSuccess,
    isError,
    data: fileUrl,
  } = useUploadFile({
    onSuccess: onUploadSuccess,
    onError: (error) => {
      if (error.name === "AbortError") return
      onError?.(error)
    },
  })

  const { mutate: deleteFile } = useDeleteFile()

  const handleRemove = () => {
    onRemove?.(fileUrl)
    if (isPending || !fileUrl) {
      abortController.current.abort()
      uploadTaskRef.current?.cancel()
    } else {
      deleteFile({ fileUrl: fileUrl })
    }
  }

  useEffect(() => {
    if (isSuccess) {
      return
    }
    abortController.current = new AbortController()
    uploadFile({
      file,
      customMetadata: metaData,
      onProgress: (bytesTransferred, totalBytes) => {
        setTransferredBytes(bytesTransferred)
        setTotalBytes(totalBytes)
      },
      uploadTaskRef,
    })
    return () => {
      if (fileUrl) {
        handleRemove()
        console.log("delete file");
      }
      uploadTaskRef.current?.cancel()
      abortController.current.abort()
    }
  }, [])

  const uploadProgress = totalBytes
    ? Math.round((transferredBytes / totalBytes) * 100)
    : 0

  return (
    <>
      <div className="flex items-center">
        <div className="w-full space-y-2 rounded bg-neutral-50 p-2 text-sm md:w-[350px] lg:w-[400px]">
          <div className="flex items-center gap-2">
            <PhotoView src={URL.createObjectURL(file)}>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="aspect-auto w-28 rounded object-cover md:w-32 lg:w-40"
              />
            </PhotoView>
            <div className="flex-1">
              <div className="flex w-fit items-center font-semibold">
                <span className="ellipsis line-clamp-1 flex-grow break-all text-left">
                  {file.name.slice(0, -extension.length)}
                </span>
                <span>{path.extname(file.name)}</span>
              </div>
              {isSuccess && (
                <div className="w-fit text-nowrap text-xs text-muted-foreground">
                  {getReadableFileSize(file.size)}
                </div>
              )}
              {isPending && (
                <div className="mt-1 w-full">
                  <Progress
                    className="h-1.5"
                    indicatorClassName="bg-accent"
                    value={uploadProgress || 0}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {`${getReadableFileSize(transferredBytes)} / ${getReadableFileSize(totalBytes)} (${uploadProgress}%)`}
                  </div>
                </div>
              )}
              {isSuccess && (
                <span className="text-success">Tải lên thành công</span>
              )}
              {isError && (
                <span className="text-destructive">Tải lên thất bại</span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="link"
          className="ml-2 p-1 text-neutral-250 transition-all hover:text-foreground"
          disabled={disabled}
          onClick={() => setIsConfirmDialogOpen(true)}
          type="button"
        >
          <Icons.trash2 className="h-5 w-5" />
        </Button>
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title={"Xác nhận xóa"}
        description={"Bạn có chắc chắn muốn xóa ảnh này không?"}
        confirmContent={"Xóa"}
        cancelContent={"Hủy"}
        onConfirm={handleRemove}
        destructive
      />
    </>
  )
}

export default FileItem
