"use client"

import Image from "next/image"
import useUser from "@/apis/users/use-user"
import { useAuth } from "@/contexts/auth-context"

import { duration } from "@/lib/utils/duration"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"
import MainPageLayout from "@/components/layouts/main-page-layout"

export default function PaymentPage() {
  const { firebaseUser } = useAuth()

  const { data: user, isLoading: isUserLoading } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
    refetchInterval: duration.seconds(28),
  })

  if (!firebaseUser?.email || isUserLoading || !user?.paymentCode) {
    return <IosLoadingSpinner />
  }

  return (
    <MainPageLayout title="Nạp tiền">
      <div className="gap-6 space-y-6 sm:flex">
        <div className="min-w-80 space-y-4">
          <h4>Nạp tiền tự động qua ngân hàng</h4>
          <Image
            src={`https://api.vietqr.io/image/970422-0835066924-QxRJkhN.jpg?accountName=DUONG%20HOANG%20NGHIA&addInfo=GS${user.paymentCode}`}
            alt="Nạp tiền"
            width={384}
            height={220}
            className="w-96 rounded-lg object-cover"
          />
        </div>
        <div className="max-w-4xl space-y-4">
          <h4>Thông Tin Chyển Khoản</h4>
          <p>
            Ngân hàng:{" "}
            <span className="font-medium">
              MB Bank - Ngân hàng TMCP Quân Đội
            </span>
          </p>

          <p>
            Số tài khoản:{" "}
            <span className="rounded bg-neutral-50 px-3 py-1.5 text-center font-medium">
              0835066924
            </span>
          </p>

          <p>
            Chủ tài khoản:{" "}
            <span className="rounded bg-neutral-50 px-3 py-1.5 text-c enter font-medium">
              DUONG HOANG NGHIA
            </span>
          </p>

          <p>
            *[Quan Trọng] Nội dung chuyển khoản (bắt buộc ghi đúng nội dung
            sau):
          </p>
          <p className=" rounded border border-accent bg-neutral-50 px-4 py-2 text-center text-lg font-medium">
            <span className="text-primary">GS</span>
            {user.paymentCode}
          </p>
          <p>
            Sau khi chuyển khoản, vui lòng chờ trong vòng 5 phút để hệ thống cập
            nhật số dư của bạn. Nếu sau 5 phút mà số dư vẫn không được cập nhật,
            vui lòng liên hệ với admin.
          </p>
        </div>
      </div>
    </MainPageLayout>
  )
}
