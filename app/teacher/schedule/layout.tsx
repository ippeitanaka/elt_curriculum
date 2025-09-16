import type { ReactNode } from "react"
import { Suspense } from "react"
import Loading from "./loading"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "講師用スケジュール",
}

export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}
