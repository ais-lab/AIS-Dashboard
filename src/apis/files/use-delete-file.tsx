import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { deleteObject, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"

type DeleteFileProps = {
  fileUrl: string
}

const deleteFile = async ({ fileUrl }: DeleteFileProps) => {
  const fileRef =  ref(storage, fileUrl)
  await deleteObject(fileRef)
}

const useDeleteFile = (
  options?: UseMutationOptions<void, Error, DeleteFileProps>
) => {
  return useMutation({
    mutationFn: deleteFile,
    ...options,
  })
}

export default useDeleteFile
