"use client"

import MainPageLayout from "@/components/layouts/main-page-layout"
import MergeSkinForm from "@/components/modules/merge/merge-skin-form"
import RecentMergeSection from "@/components/modules/merge/recent-merge-section"

export default function DashboardPage() {
  return (
    <MainPageLayout>
      <MergeSkinForm />
      <RecentMergeSection />
    </MainPageLayout>
  )
}
