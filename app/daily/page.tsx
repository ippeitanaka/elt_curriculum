import { Suspense } from "react"
import DailyViewer from "../../components/DailyViewer"
import Loading from "../curriculum/loading"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "全学年表示",
}

export default function DailyPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Loading />}>
        <DailyViewer />
      </Suspense>
    </div>
  )
}
