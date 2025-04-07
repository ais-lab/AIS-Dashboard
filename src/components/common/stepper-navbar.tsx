"use client"

import { useRouter } from "next/navigation"

import { Button } from "../ui/button"

interface Props {}

const StepperNavbar = (props: Props) => {
  const {} = props
  const router = useRouter()
  return (
    <nav className="flex h-fit items-center justify-between border-b px-8 py-6">
      <Button
        variant="link"
        onClick={() => router.back()}
        className="text-foreground"
      >
        Exit
      </Button>
    </nav>
  )
}

export default StepperNavbar
