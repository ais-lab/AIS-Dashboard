import { useMemo, useState } from "react"
import useUser from "@/apis/users/use-user"
import { useAuth } from "@/contexts/auth-context"

import { Account } from "@/types/models"
import { duration } from "@/lib/utils/duration"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/common/icons"

import { accountColumns } from "./column"
import { DataTable } from "./data-table"

import _isNil from "lodash/isNil"

const AccountTable = () => {
  const { firebaseUser } = useAuth()

  const { data, isLoading: isUserLoading } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
    staleTime: duration.minutes(1),
    refetchInterval: duration.seconds(16),
  })

  const [search, setSearch] = useState("")

  const accountData = useMemo(() => {
    let i = 0
    return data?.accounts
      ? (Object.entries(data.accounts)
          .map(([id, account]) => {
            if (account.status === "deleted") return null
            return {
              ...account,
              id,
            }
          })
          .filter((v) => v !== null)
          .filter((v) => {
            return !!search ? v?.id.toLowerCase().includes(search.toLowerCase()) : true
          })
          .sort((a, b) => {
            return (
              new Date(b!.createdAt!).getTime() -
              new Date(a!.createdAt!).getTime()
            )
          })
          .map((v) => {
            const { id, ...rest } = v as Account
            return {
              ...rest,
              id: id.trim(),
              index: ++i,
            }
          }) as Account[])
          .filter((v) => !_isNil(v.duration))
      : []
  }, [data?.accounts, search])

  return (
    <div className="mt-2 space-y-4">
      <div>
        <Input
          placeholder="Tìm kiếm tài khoản"
          className="z-[-1] max-w-lg"
          leading={
            <Icons.search className="mr-1 size-4 text-muted-foreground" />
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-2 text-sm text-neutral-25">
          {accountData.length} tài khoản.
        </p>
      </div>
      <DataTable
        columns={accountColumns}
        data={accountData}
        isLoading={isUserLoading}
        defaultSorting={[{ id: "createdAt", desc: false }]}
      />
    </div>
  )
}

export default AccountTable
