"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { AccessGate } from "@/components/modules/upload/access-gate"
import { ItemList } from "@/components/modules/upload/item-list"
import { UploadForm } from "@/components/modules/upload/upload-form"

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Post on the lab screen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an image, a text slide or a countdown, and pick the dates.
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to board
          </Button>
        </Link>
      </div>

      <AccessGate>
        {(account) => (
          <>
            <UploadForm />
            <ItemList account={account} />
          </>
        )}
      </AccessGate>
    </div>
  )
}
