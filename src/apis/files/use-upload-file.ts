import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { getDownloadURL, ref, uploadBytesResumable, UploadTask } from "firebase/storage"

import { auth, storage } from "@/lib/firebase"

type UploadFileProps = {
  file: File
  onProgress?: (bytesTransferred: number, totalBytes: number) => void
  customMetadata?: Record<string, string>
  uploadTaskRef?: React.MutableRefObject<UploadTask | undefined>
}

export const uploadFile = async ({
  file,
  onProgress,
  customMetadata,
  uploadTaskRef,
}: UploadFileProps) => {
  if (!auth.currentUser?.email) {
    throw new Error("User is not authenticated")
  }
  const fileName = `${Date.now()}-${file.name}`
  const storageRef = ref(storage, `input/${auth.currentUser.email}/${fileName}`)
  const uploadTask = uploadBytesResumable(
    storageRef,
    new Blob([file], { type: file.type }),
    customMetadata && {
      customMetadata,
    }
  )
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const bytesTransferred = snapshot.bytesTransferred
      const totalBytes = snapshot.totalBytes
      onProgress?.(bytesTransferred, totalBytes)
    },
    (error) => {
      throw error
    }
  )
  if (uploadTaskRef) {
    uploadTaskRef.current = uploadTask
  }
  await uploadTask
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

const useUploadFile = (
  options?: Omit<
    UseMutationOptions<string, Error, UploadFileProps>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: uploadFile,
    ...options,
  })
}

export default useUploadFile
