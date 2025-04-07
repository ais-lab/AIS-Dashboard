"use client"

import { Metadata } from "next"
import Link from "next/link"
import { appRoutes } from "@/constants/routes"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Lỗi",
}

const PageError = () => {
  const content = (
    <div className="mt-40 flex-1 text-center">
      <h1 className="text-[200px] font-extrabold leading-[242px] text-accent">
        500
      </h1>
      <h2 className="text-[56px] font-extrabold leading-[67px]">Lỗi</h2>
      <p className="mx-auto mb-6 mt-4 max-w-lg text-muted-foreground">
        {"Có lỗi xảy ra khi tải trang này. Vui lòng thử lại sau hoặc liên hệ admin để được hỗ trợ."}
      </p>
      <Link href={siteConfig.links.facebook} target="_blank">
        <Button>Liên hệ fanpage hỗ trợ</Button>
      </Link>
    </div>
  )
  return content
}

export default PageError
