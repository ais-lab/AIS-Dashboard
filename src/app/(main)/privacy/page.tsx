import type { Metadata } from "next"
import Link from "next/link"

import { BOARD_ADMIN_EMAIL } from "@/config/site"
import { Button } from "@/components/ui/button"

// Linked from the Google sign-in consent screen, which requires a public
// privacy policy before the sign-in app can be published.

export const metadata: Metadata = {
  title: "Privacy",
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  </section>
)

const Mail = () => (
  <a href={`mailto:${BOARD_ADMIN_EMAIL}`} className="underline">
    {BOARD_ADMIN_EMAIL}
  </a>
)

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-2 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">Privacy / プライバシー</h1>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to board
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        AIS Board shows lab news on the monitor of AIS Lab, Ritsumeikan
        University. This page explains what it keeps when you sign in to post.
        <br />
        AIS Board は立命館大学 AIS
        研究室のモニターにお知らせを表示するサイトです。投稿のためにログインしたときに保存される情報を説明します。
      </p>

      <Section title="What is collected / 収集する情報">
        <p>
          When you sign in with Google, the board receives your name and email
          address. It asks for no other Google permissions, so it cannot see
          your Drive, Gmail or contacts.
          <br />
          Googleでログインすると、名前とメールアドレスを受け取ります。それ以外の権限は求めないため、DriveやGmail、連絡先は見えません。
        </p>
        <p>
          When you request access, your email, name, the note you write and the
          time you asked are saved in a members sheet. When an admin decides,
          the sheet also records who decided and when.
          <br />
          アクセスを申請すると、メールアドレス・名前・入力したメモ・申請日時がメンバー表に保存されます。管理者が承認・却下すると、その担当者と日時も記録されます。
        </p>
        <p>
          Files you post are saved in the lab&rsquo;s Google Drive folder, with
          your email in the file&rsquo;s description so you can edit or remove
          your own posts.
          <br />
          投稿したファイルは研究室のGoogleドライブのフォルダに保存されます。自分の投稿を編集・削除できるよう、ファイルの説明欄にメールアドレスが記録されます。
        </p>
      </Section>

      <Section title="Who can see it / 公開範囲">
        <p>
          Posts are public: they are shown on the lab monitor, and anyone with
          the board link can view them. Please don&rsquo;t post anything
          private.
          <br />
          投稿は公開されます。研究室のモニターに表示され、リンクを知っている人は誰でも閲覧できます。個人的な内容は投稿しないでください。
        </p>
        <p>
          The members sheet and access request emails are seen only by the board
          admins.
          <br />
          メンバー表と申請メールは、ボードの管理者だけが見られます。
        </p>
      </Section>

      <Section title="Where it is kept / 保存場所">
        <p>
          Everything is stored in Google services (Drive, Sheets, Gmail and Apps
          Script) under the lab&rsquo;s Google account. The board has no other
          server, and uses no analytics or ads. Your browser keeps your sign-in
          for about an hour, or until you sign out. Google&rsquo;s sign-in is
          covered by the{" "}
          <a
            href="https://policies.google.com/privacy"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Google Privacy Policy
          </a>
          .
          <br />
          すべての情報は研究室のGoogleアカウントのGoogleサービス（ドライブ、スプレッドシート、Gmail、Apps
          Script）に保存されます。それ以外のサーバーはなく、アクセス解析や広告も使いません。ログイン状態はサインアウトするか約1時間たつまでブラウザに保存されます。Googleログインには
          Google のプライバシーポリシーが適用されます。
        </p>
      </Section>

      <Section title="Removing your data / データの削除">
        <p>
          You can delete your posts at any time on the{" "}
          <Link href="/upload/" className="underline">
            upload page
          </Link>
          . To be removed from the members sheet, email <Mail />.
          <br />
          投稿はアップロードページからいつでも削除できます。メンバー表からの削除は{" "}
          <Mail /> までご連絡ください。
        </p>
      </Section>

      <Section title="Contact / お問い合わせ">
        <p>
          <Mail />
        </p>
      </Section>

      <p className="mt-10 text-xs text-muted-foreground">
        Last updated November 10, 2026 / 2026年11月10日更新
      </p>
    </div>
  )
}
