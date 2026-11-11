import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Monitor setup",
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
