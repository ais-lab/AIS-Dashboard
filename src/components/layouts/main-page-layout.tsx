import Link from "next/link"
import useUser from "@/apis/users/use-user"
import { appRoutes } from "@/constants/routes"
import { useAuth } from "@/contexts/auth-context"
import useUIStore from "@/stores/ui-store"
import confetti from "canvas-confetti"
import { MenuIcon } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import useValueChange from "@/hooks/useValueChange"

import { Icons } from "../common/icons"
import IosLoadingSpinner from "../common/ios-loading-spinner"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

interface Props {
  children: React.ReactNode
  title?: string
  titleClassname?: string
  hideBanner?: boolean
  onTitleClick?: () => void
}

var count = 200
var defaults = {
  origin: { y: 0.7 },
}

function fire(particleRatio: any, opts: any) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  })
}

export const fireworkOnDeposit = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export default function MainPageLayout({
  children,
  title,
  titleClassname,
  hideBanner,
  onTitleClick,
}: Props) {
  const { toggleSidebar } = useUIStore((state) => state)

  const { firebaseUser } = useAuth()
  const { data: user, isLoading: isUserLoading } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
    refetchInterval: duration.seconds(28),
  })

  useValueChange({
    value: user,
    skipNil: true,
    effect: (prev, next) => {
      const prevBalance = prev?.balance || 0
      const nextBalance = next?.balance
      if (!nextBalance) return
      if (nextBalance > prevBalance) {
        const diff = nextBalance - prevBalance
        fireworkOnDeposit()
        toast.success(
          `Đã cộng ${Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(
            diff
          )} vào tài khoản của bạn (bao gồm khuyến mãi). Cảm ơn bạn đã sử dụng dịch vụ của gheplienquan!`,
          {
            duration: duration.seconds(10),
          }
        )
      }
    },
  })

  return (
    <>
      <div className="text-md sticky top-0 z-10 flex items-center justify-start gap-4 px-4 pb-2 pt-4 backdrop-blur-md sm:pl-8 sm:pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          <Button
            variant="outline"
            onClick={() => toggleSidebar()}
            className="mb-2 w-fit"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
          <p className=" line-clamp-1 break-all">
            👋 {auth.currentUser?.email}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <p className="flex items-center rounded bg-neutral-75 px-3 py-1 text-sm">
            Số dư:{" "}
            {isUserLoading ? (
              <IosLoadingSpinner size="small" className="ml-2" />
            ) : (
              Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(user?.balance || 0)
            )}
          </p>
          <Link href={appRoutes.payment}>
            <Button variant="outline" className="h-8 w-full sm:w-fit">
              <Icons.dollarSign className=" mr-2 h-4 w-4" />
              Nạp tiền
            </Button>
          </Link>
        </div>
      </div>
      {!hideBanner && (
        <Badge className="text-md mx-4 mb-2 rounded sm:mx-8">
          📌 [HOT] Khuyến mãi: nhận 120% khi nạp trên 200k (nạp 500k nhận 600k),
          nhận 110% khi nạp trên 50k (nạp 100k nhận 110k). Nạp SLL nhắn với web
          có KM đặc biệt. Cảm ơn bạn đã sử dụng dịch vụ của gheplienquan!
        </Badge>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0 sm:p-8 sm:pt-0">
        {title && (
          <h2 className={cn("mb-2", titleClassname)} onClick={onTitleClick}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </>
  )
}
