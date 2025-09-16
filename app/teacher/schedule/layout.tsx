import type { ReactNode } from "react"
import { Suspense } from "react"
import Loading from "./loading"

export const metadata = {
  title: "講師用スケジュール",
}

export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}
