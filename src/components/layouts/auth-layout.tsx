"use client"

import { siteConfig } from "@/config/site"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/common/icons"

import GlowingBackground from "../common/glowing-background"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col overflow-x-hidden">
      <GlowingBackground className="-top-16" />
      <div className="flex max-h-[250px] min-h-[125px] grow flex-col items-center justify-center pt-2">
       <Icons.appIcon className="w-24 h-24 rounded-md" />
      </div>
      <div className="mt-4 shrink">{children}</div>
      <div className="flex grow items-end justify-center py-8">
        <Label className="text-center text-sm text-muted-foreground">
          {siteConfig.name} © {new Date().getFullYear()}
        </Label>
      </div>
    </div>
  )
}
