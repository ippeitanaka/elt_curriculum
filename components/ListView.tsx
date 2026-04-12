"use client"

import { useMemo, useEffect, useRef } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Image from "next/image"

const shortenDayOfWeek = (day: string): string => {
  const shortDays: { [key: string]: string } = {
    月曜日: "月",
    火曜日: "火",
    水曜日: "水",
    木曜日: "木",
    金曜日: "金",
    土曜日: "土",
    日曜日: "日",
  }
  return shortDays[day] || day
}

// データ項目の型を定義
interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  [key: string]: any // その他のプロパティ（クラス情報など）
}

export default function ListView({ data, filter, showExamsOnly }) {
  const today = format(new Date(), "yyyy-MM-dd")
  const todayRef = useRef<HTMLTableRowElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const initialScrollDone = useRef<boolean>(false)

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return []

    return [...data]
      .filter((item): item is ScheduleItem => {
        return item != null && typeof item === "object"
      })
      .sort((a, b) => {
        const dateA = a.日付 ? new Date(a.日付) : new Date(0)
        const dateB = b.日付 ? new Date(b.日付) : new Date(0)

        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()

        const timeA = a.時限 || ""
        const timeB = b.時限 || ""
        return timeA.localeCompare(timeB)
      })
      .filter((item) => {
        if (showExamsOnly) {
          const year = item.filteredYear || filter.year
          const cls = item.filteredClass || filter.class

          const periods = item[`${year}年${cls}クラスコマ数`] || ""
          return periods.includes("試験") || periods.includes("模試")
        }
        return true
      })
  }, [data, filter.year, filter.class, showExamsOnly])

  useEffect(() => {
    if (initialScrollDone.current) return

    const timer = setTimeout(() => {
      if (todayRef.current && tableRef.current) {
        const todayRect = todayRef.current.getBoundingClientRect()
        const tableRect = tableRef.current.getBoundingClientRect()

        const tableTop = tableRect.top
        const windowHeight = window.innerHeight
        const targetScrollTop = todayRect.top - tableTop - windowHeight / 2 + todayRect.height / 2
        tableRef.current.scrollTop = targetScrollTop
        initialScrollDone.current = true
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [sortedData])

  let currentDate = null

  if (sortedData.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-slate-500">表示するデータがありません</p>
      </div>
    )
  }

  return (
    <div
      ref={tableRef}
      className="max-h-[calc(100vh-180px)] overflow-auto rounded-[1.8rem] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <table className="min-w-[760px] text-[11px] sm:min-w-full sm:text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-900 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200 sm:text-xs sm:tracking-[0.2em]">
            <th className="w-20 whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">日付</th>
            <th className="w-8 whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">曜日</th>
            <th className="w-9 whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">時限</th>
            <th className="w-52 whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">授業内容</th>
            <th className="w-24 whitespace-nowrap px-2 py-3 sm:px-4 sm:py-4">担当講師</th>
            <th className="w-16 whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">コマ数</th>
            <th className="w-24 whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">学年・クラス</th>
          </tr>
        </thead>
        <tbody className="text-slate-600">
          {sortedData.map((item, index) => {
            if (!item || !item.日付) return null

            const date = new Date(item.日付)
            const formattedDate = format(date, "M月d日", { locale: ja })
            const isNewDate = currentDate !== item.日付
            if (isNewDate) {
              currentDate = item.日付
            }

            const year = item.filteredYear || filter.year
            const cls = item.filteredClass || filter.class

            const content = item[`${year}年${cls}クラスの授業内容`]
            const periods = item[`${year}年${cls}クラスコマ数`] || ""

            if (!content && !periods) return null

            const isExam = periods.includes("試験")
            const isMockExam = periods.includes("模試")
            const isMyStudy = content === "マイスタディ" || content === "自宅学習"

            const isToday = item.日付 === today

            return (
              <tr
                key={`${index}-${year}-${cls}`}
                ref={isToday ? todayRef : null}
                className={`
                transition
                ${isExam ? "bg-red-50 hover:bg-red-100" : ""}
                ${isMockExam && !isExam ? "bg-orange-50 hover:bg-orange-100" : ""}
                ${isMyStudy && !isExam && !isMockExam ? "bg-sky-50 hover:bg-sky-100" : ""}
                ${!isExam && !isMockExam && !isMyStudy ? "hover:bg-slate-50" : ""}
                ${isNewDate ? "border-t border-slate-200" : ""}
                ${isToday ? "ring-1 ring-inset ring-[#ffb36b]" : ""}
              `}
              >
                <td className="whitespace-nowrap px-2 py-3 font-semibold text-slate-800 sm:px-4 sm:py-4">
                  {formattedDate}
                  {isToday && (
                    <span className="ml-2 inline-block align-middle">
                      <Image
                        src="/images/qyan-transparent.png"
                        alt="今日"
                        width={16}
                        height={16}
                        className="inline-block animate-bounce"
                      />
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">{shortenDayOfWeek(item.曜日 || "")}</td>
                <td className="whitespace-nowrap px-2 py-3 font-semibold text-slate-800 sm:px-3 sm:py-4">{item.時限}</td>
                <td className="max-w-[13rem] overflow-hidden text-ellipsis whitespace-nowrap px-2 py-3 text-slate-800 sm:max-w-none sm:px-4 sm:py-4">
                  {content}
                </td>
                <td className="max-w-[7rem] overflow-hidden text-ellipsis whitespace-nowrap px-2 py-3 sm:max-w-none sm:px-4 sm:py-4">
                  {item[`${year}年${cls}クラス担当講師名`]}
                </td>
                <td className="whitespace-nowrap px-2 py-3 sm:px-3 sm:py-4">
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 sm:px-2 sm:py-1 sm:text-xs">{periods}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-medium text-slate-700 sm:px-3 sm:py-4">{`${year}年${cls}クラス`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
