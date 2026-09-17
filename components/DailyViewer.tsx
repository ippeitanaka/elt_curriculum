"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  [key: string]: any
}

interface ClassDef {
  year: number
  cls: string
}

const dayClasses: ClassDef[] = [
  { year: 1, cls: "A" },
  { year: 1, cls: "B" },
  { year: 2, cls: "A" },
  { year: 2, cls: "B" },
  { year: 3, cls: "A" },
  { year: 3, cls: "B" },
]

const nightClasses: ClassDef[] = [
  { year: 1, cls: "N" },
  { year: 2, cls: "N" },
  { year: 3, cls: "N" },
]

function getPeriodNumber(value?: string) {
  return Number.parseInt((value || "").replace(/[^0-9]/g, ""), 10) || 0
}

function getSpecialLabel(content: string, periods: string) {
  if (periods.includes("試験")) {
    return { label: "試験", className: "bg-red-100 text-red-700" }
  }
  if (periods.includes("模試")) {
    return { label: "模試", className: "bg-orange-100 text-orange-700" }
  }
  if (content === "マイスタディ" || content === "自宅学習") {
    return { label: content, className: "bg-sky-100 text-sky-700" }
  }
  if (periods.includes("実習")) {
    return { label: periods, className: "bg-emerald-100 text-emerald-700" }
  }
  return null
}

export default function DailyViewer() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [data, setData] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/curriculum?timestamp=${Date.now()}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`データ取得に失敗しました (${response.status})`)
        }

        const result = await response.json()
        if (result.error) {
          throw new Error(result.error)
        }

        setData(Array.isArray(result.data) ? result.data : [])
      } catch (err) {
        console.error("データの取得に失敗しました:", err)
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd")
  const todayKey = format(new Date(), "yyyy-MM-dd")
  const isToday = selectedDateKey === todayKey

  const filteredData = data
    .filter((item) => item && item.日付 === selectedDateKey)
    .filter((item): item is ScheduleItem => typeof item === "object" && item !== null)
    .sort((a, b) => getPeriodNumber(a.時限) - getPeriodNumber(b.時限))

  const dayRows = filteredData.filter((item) => {
    const period = getPeriodNumber(item.時限)
    return period >= 1 && period <= 4
  })

  const nightRows = filteredData.filter((item) => getPeriodNumber(item.時限) >= 5)

  const moveDate = (days: number) => {
    setSelectedDate((current) => {
      const next = new Date(current)
      next.setDate(next.getDate() + days)
      return next
    })
  }

  const handleDateInput = (value: string) => {
    const [year, month, day] = value.split("-").map(Number)
    if (year && month && day) {
      setSelectedDate(new Date(year, month - 1, day))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">時間割を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">時間割を読み込めませんでした</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="ホームへ戻る"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">全学年 日次表示</h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">選択した日の授業を全学年まとめて表示</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveDate(-1)}
            aria-label="前の日"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <ChevronLeft size={20} />
          </button>

          <label className="relative flex min-w-0 flex-1 items-center sm:flex-none">
            <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={selectedDateKey}
              onChange={(event) => handleDateInput(event.target.value)}
              aria-label="表示する日付"
              className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 sm:w-[160px]"
            />
          </label>

          <button
            type="button"
            onClick={() => moveDate(1)}
            aria-label="次の日"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            disabled={isToday}
            className="hidden h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400 sm:flex"
          >
            <RotateCcw size={15} />
            今日
          </button>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white sm:mb-5 sm:px-5">
        <div>
          <p className="text-lg font-bold sm:text-xl">
            {format(selectedDate, "M月d日（eee）", { locale: ja })}
          </p>
          <p className="text-xs text-slate-300">{format(selectedDate, "yyyy年", { locale: ja })}</p>
        </div>
        {isToday && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">今日</span>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
          <CalendarDays className="mx-auto mb-3 h-7 w-7 text-slate-300" />
          <p className="font-semibold text-slate-700">この日の授業データはありません</p>
          <p className="mt-1 text-sm text-slate-400">前後の日付を選択してください</p>
        </div>
      ) : (
        <div className="space-y-5">
          {dayRows.length > 0 && <ScheduleSection title="昼間部" subtitle="1〜4限" rows={dayRows} classes={dayClasses} />}
          {nightRows.length > 0 && <ScheduleSection title="夜間部" subtitle="5〜6限" rows={nightRows} classes={nightClasses} />}
        </div>
      )}
    </div>
  )
}

function ScheduleSection({
  title,
  subtitle,
  rows,
  classes,
}: {
  title: string
  subtitle: string
  rows: ScheduleItem[]
  classes: ClassDef[]
}) {
  return (
    <section>
      <div className="mb-2 flex items-end gap-2">
        <h2 className="text-base font-black text-slate-900 sm:text-lg">{title}</h2>
        <span className="pb-0.5 text-xs text-slate-400">{subtitle}</span>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
        <div
          className="grid border-b border-slate-200 bg-slate-50"
          style={{ gridTemplateColumns: `72px repeat(${classes.length}, minmax(0, 1fr))` }}
        >
          <div className="px-3 py-2.5 text-center text-xs font-bold text-slate-500">時限</div>
          {classes.map(({ year, cls }) => (
            <div
              key={`${year}${cls}`}
              className="border-l border-slate-200 px-2 py-2.5 text-center text-sm font-black text-slate-800"
            >
              {year}年{cls}
            </div>
          ))}
        </div>

        {rows.map((item, index) => (
          <div
            key={`${item.日付}-${item.時限}-${index}`}
            className="grid border-b border-slate-100 last:border-b-0"
            style={{ gridTemplateColumns: `72px repeat(${classes.length}, minmax(0, 1fr))` }}
          >
            <div className="flex min-h-[74px] items-center justify-center bg-slate-50 px-2 text-center">
              <span className="text-sm font-black text-slate-900">{getPeriodNumber(item.時限)}限</span>
            </div>
            {classes.map(({ year, cls }) => (
              <div key={`${year}${cls}`} className="min-w-0 border-l border-slate-100">
                <ClassContent item={item} year={year} cls={cls} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-3 lg:hidden">
        {rows.map((item, index) => (
          <div key={`${item.日付}-${item.時限}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between bg-slate-900 px-3 py-2 text-white">
              <span className="text-sm font-black">{getPeriodNumber(item.時限)}限</span>
              <span className="text-[11px] text-slate-300">{title}</span>
            </div>
            <div className={`grid ${classes.length > 3 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
              {classes.map(({ year, cls }) => (
                <div key={`${year}${cls}`} className="min-w-0 border-b border-r border-slate-100 last:border-b-0">
                  <div className="bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-600">
                    {year}年{cls}
                  </div>
                  <ClassContent item={item} year={year} cls={cls} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClassContent({ item, year, cls }: { item: ScheduleItem; year: number; cls: string }) {
  const content = String(item[`${year}年${cls}クラスの授業内容`] || "").trim()
  const teacher = String(item[`${year}年${cls}クラス担当講師名`] || "").trim()
  const periods = String(item[`${year}年${cls}クラスコマ数`] || "").trim()
  const special = getSpecialLabel(content, periods)

  if (!content && !teacher && !periods) {
    return <div className="flex min-h-[74px] items-center justify-center px-2 text-sm text-slate-300">—</div>
  }

  return (
    <div className="min-h-[74px] px-2.5 py-2 sm:px-3">
      <div className="flex items-start justify-between gap-1.5">
        <p className="min-w-0 flex-1 text-[13px] font-bold leading-[1.25rem] text-slate-900 sm:text-sm">
          {content || "—"}
        </p>
        {special && (
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${special.className}`}>
            {special.label}
          </span>
        )}
      </div>
      {teacher && <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">{teacher}</p>}
    </div>
  )
}
