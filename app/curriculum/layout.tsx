import type { ReactNode } from "react"
import { Suspense } from "react"
import Loading from "./loading"

export default function CurriculumLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}
