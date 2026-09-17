import { Suspense } from "react"
import DailyViewer from "../../components/DailyViewer"
import Loading from "../curriculum/loading"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "全学年 日次表示",
}

export default function DailyPage() {
  return (
    <div className="w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-6">
      <Suspense fallback={<Loading />}>
        <DailyViewer />
      </Suspense>
    </div>
  )
}
