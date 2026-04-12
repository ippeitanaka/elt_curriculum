"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import DatePicker from "./DatePicker"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Layers3, Sparkles, User } from "lucide-react"
import Image from "next/image"

// データ項目の型定義
interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  [key: string]: any // その他のプロパティ（クラス情報など）
}

export default function DailyViewer() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [data, setData] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const years = [1, 2, 3]
  const dayClasses = ["A", "B"] // 昼間部クラス
  const nightClasses = ["N"] // 夜間部クラス

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/curriculum?timestamp=${new Date().getTime()}`)
        if (!response.ok) {
          throw new Error(`APIリクエストが失敗しました: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        if (result.error) {
          throw new Error(`APIエラー: ${result.error}`)
        }

        if (!result.data) {
          console.warn("API からのレスポンスにデータがありません")
          setData([])
        } else {
          setData(result.data)
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error)
        setError(error instanceof Error ? error.message : JSON.stringify(error))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-slate-900"></div>
        <p className="text-sm font-medium text-slate-600">データを読み込んでいます...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 p-6 text-center text-red-700 shadow-sm">
        <p className="text-sm font-medium">エラーが発生しました: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          再試行
        </button>
      </div>
    )
  }

  const formatDateForFilter = (date) => {
    return format(date, "yyyy-MM-dd")
  }

  const filteredData = selectedDate
    ? data.filter((item) => item && item.日付 === formatDateForFilter(selectedDate))
    : []

  // 時限でソート
  const sortedData = [...filteredData]
    .filter((item): item is ScheduleItem => item != null && typeof item === "object" && item.時限 !== undefined)
    .sort((a, b) => {
      return (a.時限 || "").localeCompare(b.時限 || "")
    })

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,241,232,0.98))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#a14c1f]">
            <Sparkles size={14} />
            Daily Board
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">全学年の日次タイムライン</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                その日の授業を学年横断で俯瞰し、昼間部と夜間部の切り替わりも一目で確認できる構成にしています。
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              ホーム
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff8a5b]">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Selected Date</p>
                <p className="text-lg font-bold text-slate-900">
                  {format(selectedDate || new Date(), "yyyy年MM月dd日 (eee)", { locale: ja })}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">日付を切り替えると、その日の全学年スケジュールに即座に反映されます。</p>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-slate-900 p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Layers3 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Coverage</p>
                <p className="text-lg font-bold">1日分を一画面で確認</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-300">各時限の授業内容、担当講師、試験種別を色分けして表示します。</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Schedule Notes</p>
                <p className="text-lg font-bold text-slate-900">表示ルール</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl bg-[#fff6ef] p-4 text-sm leading-6 text-slate-700">1限から4限は昼間部を表示します。</div>
              <div className="rounded-2xl bg-[#eef6ff] p-4 text-sm leading-6 text-slate-700">5限から6限は夜間部を表示します。</div>
              <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">試験と模試は色で強調されます。</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/80 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={18} />
              <div className="text-sm font-semibold">
                {format(selectedDate || new Date(), "yyyy年MM月dd日 (eee)", { locale: ja })}
              </div>
            </div>
            {selectedDate && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-semibold text-[#a14c1f]">
                <Image
                  src="/images/qyan-transparent.png"
                  alt="今日"
                  width={18}
                  height={18}
                  className="inline-block animate-bounce"
                />
                TODAY
              </span>
            )}
          </div>

          {filteredData.length === 0 ? (
            <div className="rounded-[1.8rem] border border-yellow-200 bg-yellow-50/90 p-8 text-center shadow-sm">
              <div className="flex flex-col items-center">
                <Calendar size={26} className="mb-2 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  {selectedDate
                    ? `${format(selectedDate, "yyyy年MM月dd日", { locale: ja })}のデータはありません`
                    : "日付を選択してください"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="rounded-[1.4rem] bg-slate-900 px-5 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                {format(selectedDate, "yyyy年MM月dd日 (eee)", { locale: ja })} の全学年表示
              </h2>

              {sortedData.map((item, index) => {
                const periodNum = Number.parseInt((item.時限 || "").replace(/[^0-9]/g, ""), 10) || 0
                const showDayClasses = periodNum <= 4
                const showNightClasses = periodNum >= 5
                const bgColors = [
                  "from-[#fff6ef] to-white border-[#ffd9c7]",
                  "from-[#eef6ff] to-white border-[#cfe0ff]",
                  "from-[#effaf6] to-white border-[#cdeee1]",
                  "from-[#fff7db] to-white border-[#f7df9c]",
                  "from-[#f9f5ff] to-white border-[#e4d8ff]",
                  "from-[#f4f7fb] to-white border-[#d9e2ee]",
                ]
                const colorIndex = (periodNum - 1) % bgColors.length
                const bgColorClass = bgColors[colorIndex]

                return (
                  <div key={index} className={`rounded-[1.8rem] border bg-gradient-to-r ${bgColorClass} p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]`}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
                        <Clock size={14} />
                        {item.時限}時限 ({item.曜日})
                      </h3>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {showDayClasses ? "昼間部" : "夜間部"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {showDayClasses && (
                        <div>
                          <h4 className="mb-2 inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                            昼間部
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {years.map((year) =>
                              dayClasses.map((cls) => (
                                <div key={`${year}${cls}`} className="overflow-hidden rounded-[1.2rem] border border-white/80 bg-white/80 shadow-sm">
                                  <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                                    {year}年{cls}クラス
                                  </div>
                                  <ClassContent item={item} year={year} cls={cls} />
                                </div>
                              )),
                            )}
                          </div>
                        </div>
                      )}

                      {showNightClasses && (
                        <div>
                          <h4 className="mb-2 inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                            夜間部
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {years.map((year) =>
                              nightClasses.map((cls) => (
                                <div key={`${year}${cls}`} className="overflow-hidden rounded-[1.2rem] border border-white/80 bg-white/80 shadow-sm">
                                  <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                                    {year}年{cls}クラス
                                  </div>
                                  <ClassContent item={item} year={year} cls={cls} />
                                </div>
                              )),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClassContent({ item, year, cls }) {
  const content = item[`${year}年${cls}クラスの授業内容`]
  const teacher = item[`${year}年${cls}クラス担当講師名`]
  const periods = item[`${year}年${cls}クラスコマ数`]

  if (!content && !periods) {
    return <div className="h-20 bg-slate-50 px-3 py-3 text-xs text-slate-400">データなし</div>
  }

  const isExam = periods?.includes("試験")
  const isMockExam = periods?.includes("模試")
  const isSelfStudy = content === "マイスタディ" || content === "自宅学習"

  let bgColorClass = "bg-white"
  if (isExam) bgColorClass = "bg-red-50"
  else if (isMockExam) bgColorClass = "bg-orange-50"
  else if (isSelfStudy) bgColorClass = "bg-sky-50"

  return (
    <div className={`h-20 overflow-hidden px-3 py-3 ${bgColorClass}`}>
      {content && <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{content}</p>}
      <div className="mt-2 flex items-center justify-between gap-2">
        {teacher && (
          <div className="flex min-w-0 items-center">
            <User size={10} className="mr-1 text-slate-500" />
            <p className="truncate text-[11px] text-slate-600">{teacher}</p>
          </div>
        )}
        {periods && (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold leading-none ${
              isExam
                ? "bg-red-100 text-red-700"
                : isMockExam
                  ? "bg-orange-100 text-orange-700"
                  : isSelfStudy
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-700"
            }`}
          >
            {periods}
          </span>
        )}
      </div>
    </div>
  )
}
