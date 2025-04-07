"use client"

import { useGetRefCode } from "@/apis/auth/use-refcode"
import useUser from "@/apis/users/use-user"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

import { duration } from "@/lib/utils/duration"
import useValueChange from "@/hooks/useValueChange"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"
import MainPageLayout, {
  fireworkOnDeposit,
} from "@/components/layouts/main-page-layout"

export default function PaymentPage() {
  const { firebaseUser } = useAuth()

  const { data: user, isLoading: isUserLoading } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
  })

  const { data: refCode, isLoading: isRefCodeLoading } = useGetRefCode({
    refcode: user?.affiliate || "",
    enabled: !!user?.affiliate,
    refetchInterval: duration.seconds(27),
  })

  useValueChange({
    value: refCode,
    skipNil: true,
    effect: (prev, next) => {
      const prevBalance = prev?.balance || 0
      const nextBalance = next?.balance || 0

      const diff = Math.abs(nextBalance - prevBalance)

      if (nextBalance < prevBalance) {
        toast.info(
          `Đã rút ${Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(diff)}`
        )
      }

      if (nextBalance > prevBalance) {
        fireworkOnDeposit()
        toast.success(
          `Tiền về mã giới thiệu +${Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(diff)}`,
          { duration: 10000 }
        )
      }
    },
  })

  useValueChange({
    value: refCode,
    skipNil: true,
    effect: (prev, next) => {
      const prevTotalUsed = prev?.usedBy?.length || 0
      const nextTotalUsed = next?.usedBy?.length || 0

      if (nextTotalUsed > prevTotalUsed) {
        toast.info(
          `Có thêm ${nextTotalUsed - prevTotalUsed} người sử dụng mã giới thiệu của bạn`,
          { duration: 8000 }
        )
      }
    },
  })

  if (isUserLoading || isRefCodeLoading)
    return <IosLoadingSpinner size="medium" />

  const referalsCount = refCode?.usedBy?.length || 0
  const totalReferals = referalsCount

  const balance = refCode?.balance || 0
  const totalBalance = balance

  const comission = refCode?.comission || 0

  return (
    <MainPageLayout title="Tiếp thị liên kết" hideBanner>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="w-full md:col-span-2">
          <CardHeader className="pb-1">Có thể rút về</CardHeader>
          <CardContent className="text-2xl font-bold">
            {Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalBalance)}
            {/* <br />
            <span className="text-sm font-normal text-muted-foreground">
              (Tool spam:{" "}
              {Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(balance)}
              , Tool ghép:{" "}
              {Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(balanceGhep)}
              )
            </span> */}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-1">Đã giới thiệu</CardHeader>
          <CardContent className="text-xl font-bold">
            {totalReferals} người
            {/* <br />
            <span className="text-sm font-normal text-muted-foreground">
              (Tool spam: {referalsCount} người, Tool ghép: {referalsCountGhep}{" "}
              người)
            </span> */}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-1">Mã giới thiệu</CardHeader>
          <CardContent className="text-xl font-bold">{refCode?.id}</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-1">Link giới thiệu</CardHeader>
          <CardContent className="text-sm font-bold lg:text-lg">
            {`https://${refCode?.id}.gheplienquan.com`}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-1">Phần trăm hoa hồng</CardHeader>
          <CardContent className="text-xl font-bold">
            {comission * 100}%
          </CardContent>
        </Card>
      </div>
    </MainPageLayout>
  )
}
