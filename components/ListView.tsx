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

export default function ListView({ data, filter, selectedInstructor, showExamsOnly }) {
  // 今日の日付を取得
  const today = format(new Date(), "yyyy-MM-dd")
  const todayRef = useRef<HTMLTableRowElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const initialScrollDone = useRef<boolean>(false)

  const sortedData = useMemo(() => {
    // データが null または空の場合は空の配列を返す
    if (!data || data.length === 0) return []

    return [...data]
      .filter((item): item is ScheduleItem => {
        // nullまたはundefinedのアイテムをフィルタリング
        return item != null && typeof item === "object"
      })
      .sort((a, b) => {
        // 日付プロパティが存在するか確認
        const dateA = a.日付 ? new Date(a.日付) : new Date(0)
        const dateB = b.日付 ? new Date(b.日付) : new Date(0)

        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()

        // 時限プロパティが存在するか確認
        const timeA = a.時限 || ""
        const timeB = b.時限 || ""
        return timeA.localeCompare(timeB)
      })
      .filter((item) => {
        if (showExamsOnly) {
          const year = item.filteredYear || filter.year
          const cls = item.filteredClass || filter.class

          // コマ数に「試験」または「模試」が含まれる場合
          const periods = item[`${year}年${cls}クラスコマ数`] || ""
          return periods.includes("試験") || periods.includes("模試")
        }
        return true
      })
  }, [data, filter.year, filter.class, showExamsOnly])

  // コンポーネントがマウントされたとき、または表示モードが変更されたときに今日の日付にスクロール
  useEffect(() => {
    // 初回のスクロールのみ実行するためのチェック
    if (initialScrollDone.current) return

    // 少し遅延させてDOMが完全に描画された後にスクロールする
    const timer = setTimeout(() => {
      if (todayRef.current && tableRef.current) {
        // 今日の日付の位置を取得
        const todayRect = todayRef.current.getBoundingClientRect()
        const tableRect = tableRef.current.getBoundingClientRect()

        // テーブルのビューポート内での位置を計算
        const tableTop = tableRect.top
        const tableHeight = tableRect.height
        const windowHeight = window.innerHeight

        // 今日の日付が画面の中央に来るようにスクロール位置を調整
        const targetScrollTop = todayRect.top - tableTop - windowHeight / 2 + todayRect.height / 2

        // スクロール位置を設定
        tableRef.current.scrollTop = targetScrollTop

        // スクロールが完了したことをマーク
        initialScrollDone.current = true
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [sortedData]) // sortedDataが変更されたときに再実行

  let currentDate = null

  // データがない場合のメッセージ
  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">表示するデータがありません</p>
      </div>
    )
  }

  // リストビューの高さを最大化
  return (
    <div ref={tableRef} className="overflow-auto bg-white rounded-lg shadow-lg max-h-[calc(100vh-120px)]">
      <table className="min-w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
            <th className="py-2 px-3 text-left w-20">日付</th>
            <th className="py-2 px-2 text-left w-8">曜日</th>
            <th className="py-2 px-2 text-left w-8">時限</th>
            <th className="py-2 px-3 text-left w-48">授業内容</th>
            <th className="py-2 px-3 text-left w-20">担当講師</th>
            <th className="py-2 px-2 text-left w-16">コマ数</th>
            <th className="py-2 px-2 text-left w-28">学年・クラス</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {sortedData.map((item, index) => {
            // 既存のロジックはそのまま...
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

            let bgColorClass = "bg-white bg-opacity-70"
            if (isExam) bgColorClass = "bg-red-50"
            else if (isMockExam) bgColorClass = "bg-orange-50"
            else if (isMyStudy) bgColorClass = "bg-sky-50"

            return (
              <tr
                key={`${index}-${year}-${cls}`}
                ref={isToday ? todayRef : null}
                className={`
                ${isExam ? "bg-red-100 hover:bg-red-200" : ""}
                ${isMockExam && !isExam ? "bg-orange-100 hover:bg-orange-200" : ""}
                ${isMyStudy && !isExam && !isMockExam ? "bg-sky-100 hover:bg-sky-200" : ""}
                ${!isExam && !isMockExam && !isMyStudy ? "hover:bg-gray-50" : ""}
                ${isNewDate ? "border-t border-gray-300" : ""}
                ${isToday ? "bg-yellow-50 hover:bg-yellow-100" : ""}
              `}
              >
                <td className="py-2 px-3 text-left whitespace-nowrap">
                  {formattedDate}
                  {isToday && (
                    <span className="ml-1 inline-block align-middle">
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
                <td className="py-2 px-2 text-left">{shortenDayOfWeek(item.曜日 || "")}</td>
                <td className="py-2 px-2 text-left">{item.時限}</td>
                <td className="py-2 px-3 text-left">{content}</td>
                <td className="py-2 px-3 text-left">{item[`${year}年${cls}クラス担当講師名`]}</td>
                <td className="py-2 px-2 text-left">{periods}</td>
                <td className="py-2 px-2 text-left">{`${year}年${cls}クラス`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
