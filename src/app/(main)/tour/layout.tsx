import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tour / ツアー",
}

export default function TourLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
