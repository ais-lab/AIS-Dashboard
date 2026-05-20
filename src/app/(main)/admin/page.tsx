"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { displayItemKeys } from "@/constants/query-key-factory"
import {
  clearFolderOverride,
  getDefaultFolderId,
  readFolderOverride,
  setFolderOverride,
} from "@/lib/utils/folder-override"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const extractFolderId = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const match = trimmed.match(/folders\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : trimmed
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const buildTimeFolderId = getDefaultFolderId()
  const [override, setOverride] = useState<string | null>(null)
  const [input, setInput] = useState("")

  useEffect(() => {
    setOverride(readFolderOverride())
  }, [])

  const active = override || buildTimeFolderId
  const isOverridden = !!override && override !== buildTimeFolderId

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !input.trim()) return ""
    const id = extractFolderId(input)
    const url = new URL(window.location.origin + window.location.pathname)
    url.pathname = url.pathname.replace(/\/admin\/?$/, "/")
    url.searchParams.set("folder", id)
    return url.toString()
  }, [input])

  const apply = () => {
    const id = extractFolderId(input)
    if (!id) {
      toast.error(
        "Paste a folder ID or URL / フォルダIDまたはURLを貼り付けてください"
      )
      return
    }
    setFolderOverride(id)
    setOverride(id)
    queryClient.invalidateQueries({ queryKey: displayItemKeys.all() })
    toast.success(
      "Override applied (this browser only) / 上書きを適用しました（このブラウザのみ）"
    )
  }

  const reset = () => {
    clearFolderOverride()
    setOverride(null)
    queryClient.invalidateQueries({ queryKey: displayItemKeys.all() })
    toast.success("Reverted to default / 既定値に戻しました")
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin / 管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure which Drive folder the board reads from. /
            ボードが読み込むDriveフォルダを設定します。
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back / 戻る
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Current source / 現在のソース
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isOverridden ? "default" : "outline"}>
              {isOverridden
                ? "Local override / ローカル上書き"
                : "Built-in default / 既定値"}
            </Badge>
            <code className="break-all rounded bg-muted px-2 py-1 font-mono text-xs">
              {active || "(not set / 未設定)"}
            </code>
          </div>
          {isOverridden && (
            <p className="text-xs text-muted-foreground">
              Built-in default / 既定値:{" "}
              <code className="font-mono">{buildTimeFolderId}</code>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Overrides are stored in this browser&rsquo;s localStorage. Other
            kiosks/visitors still see the built-in default unless you share a
            URL with <code>?folder=&lt;id&gt;</code>. /
            上書き設定はこのブラウザのlocalStorageに保存されます。他のキオスクや
            訪問者は、<code>?folder=&lt;id&gt;</code>付きのURLを共有しない限り
            既定値を見ます。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-10 border-primary/40">
        <CardHeader>
          <CardTitle className="text-base">
            Override (this browser) / 上書き（このブラウザのみ）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder">
              Drive folder ID or URL / DriveフォルダIDまたはURL
            </Label>
            <Input
              id="folder"
              placeholder="https://drive.google.com/drive/folders/0B…  or / または  0B…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full folder URL or just the ID — the ID is extracted
              automatically. /
              URL全体またはIDだけを貼り付けてください。IDは自動的に抽出されます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={apply} disabled={!input.trim()}>
              Apply override / 上書きを適用
            </Button>
            <Button variant="outline" onClick={reset} disabled={!override}>
              Reset to default / 既定値に戻す
            </Button>
            {shareUrl && (
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    toast.success(
                      "Shareable URL copied / 共有URLをコピーしました"
                    )
                  } catch {
                    toast.error("Copy failed / コピーに失敗しました")
                  }
                }}
              >
                Copy shareable URL / 共有URLをコピー
              </Button>
            )}
          </div>
          {shareUrl && (
            <code className="block break-all rounded bg-muted px-3 py-2 font-mono text-xs">
              {shareUrl}
            </code>
          )}
        </CardContent>
      </Card>

      <Separator className="mb-10" />

      <h2 className="mb-3 text-xl font-semibold">
        Trust model / 信頼モデル
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The board runs entirely in the browser. To read a folder it uses a
        public API key and the folder&rsquo;s link-share permission. There is
        no server. /
        ボードは完全にブラウザ上で動作します。フォルダの読み込みには公開APIキーと
        フォルダのリンク共有権限を使用します。サーバーはありません。
      </p>
      <ul className="mb-10 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>Anyone with the link → Viewer.</strong> The kiosk and any
          curious visitor can list files and read contents. Don&rsquo;t put
          private material in this folder. /{" "}
          <strong>リンクを知っている全員 → 閲覧者。</strong>
          キオスクおよび訪問者は、ファイル一覧と内容を読めます。
          このフォルダに機密情報を入れないでください。
        </li>
        <li>
          <strong>Specific people → Editor.</strong> Add the Google accounts of
          content managers in Drive&rsquo;s share dialog. Only they can upload,
          rename, or delete files. /{" "}
          <strong>特定のユーザー → 編集者。</strong>
          コンテンツ管理者のGoogleアカウントをDriveの共有ダイアログから
          追加してください。アップロード・改名・削除が可能になります。
        </li>
        <li>
          <strong>API key restriction.</strong> The Google Cloud API key is
          restricted by HTTP referrer to the Pages domain — it cannot be reused
          on other origins. /{" "}
          <strong>APIキー制限。</strong>
          Google CloudのAPIキーはHTTPリファラでPagesドメインに制限されており、
          他のオリジンからは利用できません。
        </li>
      </ul>

      <h2 className="mb-3 text-xl font-semibold">
        Set up a new folder / 新しいフォルダの設定
      </h2>
      <ol className="mb-10 list-decimal space-y-3 pl-5 text-sm">
        <li>
          In Google Drive, create the folder. Open it and copy the URL —
          everything after <code>/folders/</code> is the folder ID. /
          Google Driveでフォルダを作成し、URLをコピー。<code>/folders/</code>
          以降がフォルダIDです。
        </li>
        <li>
          Click <strong>Share</strong> → <em>General access</em>: set to{" "}
          <strong>Anyone with the link</strong> with role{" "}
          <strong>Viewer</strong>. /{" "}
          <strong>共有</strong>をクリック → <em>一般的なアクセス</em>を
          <strong>リンクを知っている全員</strong>、ロールを
          <strong>閲覧者</strong>に設定。
        </li>
        <li>
          Still in the share dialog, add the Google accounts that should be
          able to upload/edit. Give them role <strong>Editor</strong>. /
          同じ共有ダイアログで、アップロード・編集権限を渡したいGoogle
          アカウントを追加し、ロールを<strong>編集者</strong>に。
        </li>
        <li>
          Paste the folder URL or ID into the override box above to try it on
          this browser, then verify the board picks up the change. /
          上の上書きボックスにURLかIDを貼り付けて、このブラウザで試してみてください。
          ボードが切り替わることを確認します。
        </li>
        <li>
          Filenames inside the folder follow the rules in the{" "}
          <Link href="/tutorial/" className="underline">
            filename guide / ファイル名ガイド
          </Link>
          .
        </li>
      </ol>

      <h2 className="mb-3 text-xl font-semibold">
        Make the change permanent (for everyone) / 全員に対して恒久的に変更する
      </h2>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        <li>
          On GitHub: <strong>Settings</strong> →{" "}
          <strong>Secrets and variables</strong> → <strong>Actions</strong> →{" "}
          <strong>Variables</strong>. / GitHubで <strong>Settings</strong> →{" "}
          <strong>Secrets and variables</strong> → <strong>Actions</strong> →{" "}
          <strong>Variables</strong>。
        </li>
        <li>
          Edit <code>NEXT_PUBLIC_DRIVE_FOLDER_ID</code> and paste the new
          folder ID. Save. /{" "}
          <code>NEXT_PUBLIC_DRIVE_FOLDER_ID</code>
          を編集し、新しいフォルダIDを保存します。
        </li>
        <li>
          Go to <strong>Actions</strong> → <em>Deploy to GitHub Pages</em> →{" "}
          <strong>Run workflow</strong>. Once it finishes, all kiosks (and
          anyone without a local override) will use the new folder. /{" "}
          <strong>Actions</strong> → <em>Deploy to GitHub Pages</em> →{" "}
          <strong>Run workflow</strong>を実行。完了すると、ローカル上書きが
          ない全員に新しいフォルダが適用されます。
        </li>
        <li>
          Optional: clear the local override above so this browser also picks
          up the new default. /
          任意：上のローカル上書きをリセットして、このブラウザにも
          新しい既定値を反映できます。
        </li>
      </ol>
    </div>
  )
}
