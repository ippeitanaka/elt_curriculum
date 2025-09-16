import { Suspense } from "react"
import DailyViewer from "../../components/DailyViewer"
import Loading from "../curriculum/loading"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "全学年表示",
}

export const dynamic = "force-dynamic"

export default function DailyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">全学年表示</h1>
      <Suspense fallback={<Loading />}>
        <DailyViewer />
      </Suspense>
    </div>
  )
}
