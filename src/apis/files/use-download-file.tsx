import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { saveAs } from "file-saver"

type DownloadFileProps = {
  url: string
  fileName: string
}

async function fetchFile({ url, fileName }: { url: string; fileName: string }) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch the PDF file")
  }
  const blobData = await response.blob()
  saveAs(blobData, fileName)
}

type UseDownloadFileOptions = Omit<
  UseMutationOptions<void, Error, DownloadFileProps>,
  "mutationFn"
>

const useDownloadFile = (options?: UseDownloadFileOptions) => {
  return useMutation({
    mutationFn: fetchFile,
    ...options,
  })
}

export default useDownloadFile
