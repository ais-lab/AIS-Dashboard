import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to use / 使い方",
}

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
