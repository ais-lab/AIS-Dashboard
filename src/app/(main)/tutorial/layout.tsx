import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Filename guide / ファイル名ガイド",
}

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
