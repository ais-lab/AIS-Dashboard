"use client"

import { isBoardApiConfigured, Member } from "@/apis/board-api/client"
import {
  useAccount,
  useDecideMember,
  useMembers,
  useRemoveMember,
  useSetMemberRole,
} from "@/apis/board-api/hooks"
import { toast } from "sonner"

import dayjsConfig from "@/config/dayjs"
import { signOut, useGoogleAuth } from "@/lib/auth/google-auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleSignInButton } from "@/components/common/google-sign-in-button"

// Approving who may post through /upload. Hidden until the Apps Script API
// is configured.

const onError = (err: unknown) => toast.error((err as Error).message)

export const MembersPanel = () => {
  const { user } = useGoogleAuth()
  const { data: account, isLoading } = useAccount()
  const isAdmin = account?.role === "admin" && account.status === "approved"

  if (!isBoardApiConfigured()) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Who can post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && <GoogleSignInButton />}
        {user && isLoading && (
          <p className="text-sm text-muted-foreground">
            Checking your account…
          </p>
        )}
        {user && account && !isAdmin && (
          <p className="text-sm text-muted-foreground">
            Signed in as {account.email}, which is not an admin.{" "}
            <button className="underline" onClick={signOut}>
              Sign out
            </button>
          </p>
        )}
        {isAdmin && (
          <>
            <MemberLists />
            <p className="text-xs text-muted-foreground">
              Signed in as {account.email}.{" "}
              <button className="underline" onClick={signOut}>
                Sign out
              </button>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

const MemberLists = () => {
  const { data: members, isLoading, error } = useMembers(true)
  const decide = useDecideMember()
  const setRole = useSetMemberRole()
  const remove = useRemoveMember()

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>
  if (error) return <p className="text-sm text-destructive">{error.message}</p>

  const pending = members?.filter((m) => m.status === "pending") ?? []
  const approved = members?.filter((m) => m.status === "approved") ?? []
  const declined = members?.filter((m) => m.status === "rejected") ?? []

  const who = (m: Member) => (
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium">{m.name || m.email}</p>
      <p className="truncate text-xs text-muted-foreground">
        {m.name ? m.email : ""}
        {m.requestedAt && m.status === "pending"
          ? ` · asked ${dayjsConfig(m.requestedAt).format("MMM D, HH:mm")}`
          : ""}
      </p>
      {m.note && m.status === "pending" && (
        <p className="mt-1 text-sm">&ldquo;{m.note}&rdquo;</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="mb-2 text-sm font-semibold">
          Waiting for approval{" "}
          <Badge variant={pending.length ? "default" : "outline"}>
            {pending.length}
          </Badge>
        </h3>
        {pending.length === 0 && (
          <p className="text-muted-foreground">No pending requests.</p>
        )}
        <ul className="list-none divide-y divide-border pl-0">
          {pending.map((m) => (
            <li key={m.email} className="flex items-start gap-3 py-2">
              {who(m)}
              <Button
                size="sm"
                onClick={() =>
                  decide
                    .mutateAsync({ email: m.email, status: "approved" })
                    .then(() => toast.success(`${m.email} can now post`))
                    .catch(onError)
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  decide
                    .mutateAsync({ email: m.email, status: "rejected" })
                    .catch(onError)
                }
              >
                Decline
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Members</h3>
        <ul className="list-none divide-y divide-border pl-0">
          {approved.map((m) => (
            <li key={m.email} className="flex items-center gap-3 py-2">
              {who(m)}
              <Badge variant={m.role === "admin" ? "default" : "outline"}>
                {m.owner ? "owner" : m.role}
              </Badge>
              {!m.owner && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setRole
                        .mutateAsync({
                          email: m.email,
                          role: m.role === "admin" ? "member" : "admin",
                        })
                        .catch(onError)
                    }
                  >
                    {m.role === "admin" ? "Make member" : "Make admin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.confirm(
                        `Remove ${m.email}? They can ask again.`
                      ) && remove.mutateAsync({ email: m.email }).catch(onError)
                    }
                  >
                    Remove
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {declined.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold">Declined</h3>
          <ul className="list-none divide-y divide-border pl-0">
            {declined.map((m) => (
              <li key={m.email} className="flex items-center gap-3 py-2">
                {who(m)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    decide
                      .mutateAsync({ email: m.email, status: "approved" })
                      .catch(onError)
                  }
                >
                  Approve
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
