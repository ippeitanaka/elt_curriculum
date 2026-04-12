"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Layers3, Sparkles } from "lucide-react"
import CurriculumViewer from "../../components/CurriculumViewer"

export default function CurriculumPage() {
  const searchParams = useSearchParams()
  const year = searchParams.get("year") || "1"
  const classParam = searchParams.get("class") || "A"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            ホームへ戻る
          </Link>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff1e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#a14c1f]">
              <Sparkles size={14} />
              Curriculum Overview
            </div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              {year}年{classParam}クラス カリキュラム
            </h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Layers3 size={18} />
          </div>
          <p className="max-w-xs leading-6">
            月間カレンダーと一覧表示を切り替えながら、同じクラスの予定を連続して確認できます。
          </p>
        </div>
      </div>

      <CurriculumViewer initialYear={year} initialClass={classParam} />
    </div>
  )
}
