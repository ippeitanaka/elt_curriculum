"use client"

import { useSearchParams } from "next/navigation"
import CurriculumViewer from "../../components/CurriculumViewer"

export default function CurriculumPage() {
  const searchParams = useSearchParams()
  const year = searchParams.get("year") || "1"
  const classParam = searchParams.get("class") || "A"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {year}年{classParam}クラス カリキュラム
      </h1>
      <CurriculumViewer initialYear={year} initialClass={classParam} />
    </div>
  )
}
