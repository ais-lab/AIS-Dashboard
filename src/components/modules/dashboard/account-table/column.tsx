import { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"

import { Account, runDurationLabels } from "@/types/models"
import dayjsConfig, { DAYJS_CONSTANT_DEFAULT } from "@/config/dayjs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/common/icons"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

import DeleteAccountButton from "./delete-account-button"
import ExtendAccountButton from "./extend-account-button"

export const accountColumns: ColumnDef<Account>[] = [
  {
    accessorKey: "index",
    header: "STT",
    size: 40,
  },
  {
    accessorKey: "id",
    header: "Tài khoản",
    minSize: 200,
    cell: ({ row }) => {
      const dateStr = row.original.createdAt
      const createdDate = dateStr ? new Date(dateStr) : null
      const isJustCreatedIn5Minutes =
        createdDate && dayjs().diff(createdDate, "minute") < 5
      return (
        <>
          {row.original.id}
          {isJustCreatedIn5Minutes && (
            <Badge variant="outline" className="ml-2 text-xs">
              Mới
            </Badge>
          )}
        </>
      )
    },
  },
  {
    accessorKey: "lastRun",
    header: "Lần chạy gần nhất",
    minSize: 240,
    cell: ({ row }) => {
      const dateStr = row.original.lastRun
      if (!dateStr) return "--"
      const lastRunDate = new Date(dateStr)
      return (
        <time dateTime={dateStr}>
          {dayjsConfig.tzView({
            date: lastRunDate,
            format: DAYJS_CONSTANT_DEFAULT.fullDateFormat,
          })}
        </time>
      )
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.original.lastRun)
      const dateB = new Date(b.original.lastRun)
      return dateB.getTime() - dateA.getTime()
    },
  },
  {
    accessorKey: "nextRun",
    header: "Lần chạy tiếp theo",
    minSize: 240,
    cell: ({ row }) => {
      const dateStr = row.original.nextRun
      if (!dateStr) return "--"
      const nextRunDate = new Date(dateStr)
      return (
        <time dateTime={dateStr}>
          {dayjsConfig.tzView({
            date: nextRunDate,
            format: DAYJS_CONSTANT_DEFAULT.fullDateFormat,
          })}
        </time>
      )
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.original.nextRun)
      const dateB = new Date(b.original.nextRun)
      return dateB.getTime() - dateA.getTime()
    },
  },
  {
    accessorKey: "status",
    minSize: 200,
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status
      let children = <>Unknow</>
      let textColor = "text-muted-foreground"
      switch (status) {
        case "active":
          textColor = "text-neutral-50"
          children = (
            <>
              <Icons.calendar className="size-4" />
              <span>Chờ chạy</span>
            </>
          )
          break
        case "pending":
        case "running":
          textColor = "text-neutral-50"
          children = (
            <>
              <IosLoadingSpinner size="mini" />
              <span className="animate-pulse">
                {status === "pending" ? "Đã lên lịch" : "Đang chạy"}
              </span>
            </>
          )
          break
        case "success":
          const lastRunStr = row.original.lastRun
          const nextRunStr = row.original.nextRun
          const lastRunDate = lastRunStr ? new Date(lastRunStr) : null
          const nextRunDate = nextRunStr ? new Date(nextRunStr) : null
          const diffInHours =
            lastRunDate && nextRunDate
              ? dayjs(nextRunDate).diff(lastRunDate, "hour")
              : 0

          const isAlreadyRun = diffInHours < 9

          textColor = isAlreadyRun ? "text-info" : "text-primary"
          children = isAlreadyRun ? (
            <>
              <Icons.badgeMinus className="size-4" />
              <span>
                Đã <strong> SPAM </strong>
                từ trước
              </span>
            </>
          ) : (
            <>
              <Icons.checkCheck className="size-4" />
              <span>Chạy thành công</span>
            </>
          )
          break
        case "skip":
          textColor = "text-info"
          children = (
            <>
              <Icons.scale className="size-4" />
              <span>Tranh chấp</span>
            </>
          )
          break
        case "invalid":
        case "error":
          const errorMsg = row.original.errorMsg
          textColor = "text-destructive"
          children = (
            <>
              <Icons.xCircle className="size-4" />
              <span>
                {status === "invalid" ? "Không tồn tại" : errorMsg || "Lỗi"}
              </span>
            </>
          )
          break
        default:
          children = <>Không xác định</>
      }

      const expiredStr = row.original.expiredAt
      let expiredDate = expiredStr ? new Date(expiredStr) : null

      if (expiredDate) {
        expiredDate = new Date(
          expiredDate.getTime() + expiredDate.getTimezoneOffset() * 60 * 1000
        )
        if (expiredDate < new Date()) {
          textColor = "text-destructive"
          children = (
            <>
              <Icons.xCircle className="size-4" />
              <span>Hết hạn</span>
            </>
          )
        }
      }

      return (
        <div
          className={cn(
            "text-warning flex items-center gap-2 transition-all duration-300",
            textColor
          )}
        >
          {children}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    minSize: 200,
    cell: ({ row }) => {
      const dateStr = row.original.createdAt
      if (!dateStr) return "--"
      const createdDate = new Date(dateStr)
      return (
        <time dateTime={dateStr}>
          {dayjsConfig.tzView({
            date: createdDate,
          })}
        </time>
      )
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.original.createdAt)
      const dateB = new Date(b.original.createdAt)
      return dateB.getTime() - dateA.getTime()
    },
  },
  {
    accessorKey: "duration",
    header: "Gói chạy",
    minSize: 200,
    cell: ({ row }) => {
      const duration = row.original.duration
      const name = runDurationLabels[duration].labelNoPrice
      const expiredStr = row.original.expiredAt
      const expiredDate =
        expiredStr && duration !== "forever" ? new Date(expiredStr) : null
      return (
        <>
          {name}
          <br />
          {expiredDate && (
            <time dateTime={expiredStr} className="text-muted-foreground">
              {` (Hết hạn: ${dayjsConfig.view(expiredDate, DAYJS_CONSTANT_DEFAULT.dateFormat)})`}
            </time>
          )}
        </>
      )
    },
  },
  {
    accessorKey: "action",
    header: "",
    minSize: 160,
    cell: ({ row }) => {
      const duration = row.original.duration
      const canExtend = duration !== "forever"
      return (
        <div className="flex gap-4">
          <DeleteAccountButton accountId={row.original.id} />
          {canExtend && <ExtendAccountButton account={row.original} />}
        </div>
      )
    },
  },
]
