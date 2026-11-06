"use client"

import { useState } from "react"
import Link from "next/link"
import { Account, isBoardApiConfigured } from "@/apis/board-api/client"
import { useAccount, useRequestAccess } from "@/apis/board-api/hooks"
import { Clock, LogOut } from "lucide-react"
import { toast } from "sonner"

import { BOARD_ADMIN_EMAIL } from "@/config/site"
import { signOut, useGoogleAuth } from "@/lib/auth/google-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { GoogleSignInButton } from "@/components/common/google-sign-in-button"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

// Walks a visitor through sign-in and access approval, then renders
// children with their account once an admin has approved them.

const Panel = ({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) => (
  <Card>
    <CardContent className="space-y-4 py-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </CardContent>
  </Card>
)

const AdminEmail = () => (
  <a href={`mailto:${BOARD_ADMIN_EMAIL}`} className="underline">
    {BOARD_ADMIN_EMAIL}
  </a>
)

export const SignedInAs = ({ email }: { email: string }) => (
  <div className="mb-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
    Signed in as {email}
    <Button variant="ghost" size="sm" onClick={signOut}>
      <LogOut className="mr-1 size-4" />
      Sign out
    </Button>
  </div>
)

export const AccessGate = ({
  children,
}: {
  children: (account: Account) => React.ReactNode
}) => {
  const { user } = useGoogleAuth()
  const { data: account, isLoading, error, refetch } = useAccount()

  if (!isBoardApiConfigured()) {
    return (
      <Panel title="Uploading isn't set up yet">
        <p className="text-sm text-muted-foreground">
          Email <AdminEmail />, or add files straight to the Drive folder for
          now (see the{" "}
          <Link href="/tutorial/" className="underline">
            guide
          </Link>
          ).
        </p>
      </Panel>
    )
  }

  if (!user) {
    return (
      <Panel title="Sign in to post on the board">
        <p className="text-sm text-muted-foreground">
          Use your Google account. The first time, you request access and the
          board admin approves you.
        </p>
        <div className="flex justify-center">
          <GoogleSignInButton />
        </div>
      </Panel>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <IosLoadingSpinner />
      </div>
    )
  }

  if (error || !account) {
    return (
      <Panel title="Couldn't reach the board service">
        <p className="text-sm text-destructive">{error?.message}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </Panel>
    )
  }

  return (
    <>
      <SignedInAs email={account.email} />
      {account.status === "approved" ? (
        children(account)
      ) : account.status === "pending" ? (
        <Panel title="Request sent">
          <Clock className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            We emailed the board admin at <AdminEmail />. You&rsquo;ll get an
            email when you can post.
          </p>
        </Panel>
      ) : account.status === "rejected" ? (
        <Panel title="Your request was declined">
          <p className="text-sm text-muted-foreground">
            Email <AdminEmail /> if you think this is a mistake.
          </p>
        </Panel>
      ) : (
        <RequestAccess />
      )}
    </>
  )
}

const RequestAccess = () => {
  const [note, setNote] = useState("")
  const request = useRequestAccess()

  return (
    <Panel title="Ask to post on the board">
      <p className="text-sm text-muted-foreground">
        Your request goes to <AdminEmail />. You only need to do this once.
      </p>
      <Textarea
        className="mx-auto min-h-[80px] max-w-md"
        placeholder="Optional: who you are, e.g. M1 student in the vision team"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button
        isLoading={request.isPending}
        onClick={() =>
          request
            .mutateAsync(note)
            .catch((err) => toast.error((err as Error).message))
        }
      >
        Request access
      </Button>
    </Panel>
  )
}
