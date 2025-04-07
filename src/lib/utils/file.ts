import path from "path"
import { round } from "lodash"

export function getFileNameFromUrl(url: string) {
  const urlObj = new URL(url)
  return decodeURIComponent(urlObj.pathname.split("/").pop() || "")
}

export const getFileType = (fileUrl: string) => {
  const extension = path
    .extname(getFileNameFromUrl(fileUrl))
    .slice(1)
    .toLowerCase()
  switch (extension) {
    case "png":
    case "jpg":
    case "jpeg":
      return "image"
    case "doc":
    case "docx":
      return "document"
    case "ppt":
    case "pptx":
      return "presentation"
    case "pdf":
      return "pdf"
    case "xls":
    case "xlsx":
      return "spreadsheet"
    case "mp4":
    case "mov":
    case "mkv":
      return "video"
    default:
      return "file"
  }
}

export const getReadableFileSize = (size: number) => {
  const sizeKb = round(size / 1024, 2)
  const sizeMb = round(sizeKb / 1024, 2)
  return sizeMb > 1 ? `${sizeMb} MB` : `${sizeKb} KB`
}
