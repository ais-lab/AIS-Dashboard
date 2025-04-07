import useUser from "@/apis/users/use-user"
import { useAuth } from "@/contexts/auth-context"
import dayjs from "dayjs"
import { PhotoProvider, PhotoView } from "react-photo-view"

import dayjsConfig from "@/config/dayjs"
import { siteConfig } from "@/config/site"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/common/icons"

interface Props {}

const RecentMergeSection = (props: Props) => {
  const { firebaseUser } = useAuth()
  const { data: user, isLoading: isUserLoading } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
  })

  const orders = (user?.orders || [])
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-center font-bold">Ghép Gần Đây</h3>
      <PhotoProvider maskOpacity={0.75}>
        <div className="bento-bg mx-auto mb-6 min-h-40 max-w-4xl p-4 lg:p-6">
          {orders.length === 0 ? (
            <div className="p-auto flex h-28 flex-col items-center justify-center rounded border-2 border-dashed text-center">
              <p>Trống</p>
              <p className="text-sm text-muted-foreground">
                Các ảnh mới ghép sẽ xuất hiện ở đây
              </p>
            </div>
          ) : (
            <div className="w-full">
              <p className="pb-2 text-xs text-muted-foreground">
                *Nhấn vào ảnh để xem full màn hình
              </p>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-stretch justify-center gap-2 pb-3"
                >
                  <PhotoView src={order.resultUrl}>
                    <img
                      src={order.resultUrl}
                      alt="result"
                      className="w-[40%] rounded-sm border border-dashed border-border object-cover p-1 md:w-[30%]"
                    />
                  </PhotoView>
                  <div className="flex flex-1 flex-col gap-1 py-0.5">
                    <time
                      className="text-sm text-muted-foreground"
                      dateTime={dayjs(order.createdAt).toISOString()}
                      title={dayjsConfig.tzView({ date: order.createdAt })}
                    >
                      {dayjsConfig.tzView({
                        date: order.createdAt,
                        isRelative: true,
                      })}
                    </time>
                    <h5 className=" text-lg font-semibold">{order.username}</h5>
                    <p className="text-sm">
                      Số ảnh yêu cầu: {order.imageCount} ảnh
                    </p>
                    <p className="hidden text-sm md:block">
                      Số thẻ đổi tên: {order.changeNameCardCount || "Không có"}{" "}
                      · Mã số tài khoản: {order.accountCode || "Không có"}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-accent underline">
                      <Icons.externalLink className="size-4" />
                      <a
                        href={order.resultUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Link ảnh
                      </a>
                    </p>
                    <p className="font-semibold">
                      Giá tiền:{" "}
                      {Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.imageCost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PhotoProvider>
      <div className="mx-auto w-full max-w-full text-center">
        <Label className="text-sm text-muted-foreground">
          {siteConfig.name} © {new Date().getFullYear()}
        </Label>
      </div>
    </div>
  )
}

export default RecentMergeSection
