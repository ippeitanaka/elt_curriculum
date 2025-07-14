"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import DatePicker from "./DatePicker"
import Link from "next/link"
import { Calendar, Home, Clock, User } from "lucide-react"
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
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-400 mb-2"></div>
        <p className="text-sm text-pink-600">データを読み込んでいます...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p className="text-sm">エラーが発生しました: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-pink-500 text-white px-2 py-1 rounded-full text-sm hover:bg-pink-600"
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
    <div className="max-w-full mx-auto">
      <div className="mb-3 flex justify-between items-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-2 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none shadow-sm"
        >
          <Home size={14} className="mr-1" /> ホーム
        </Link>

        <div className="text-sm font-medium text-purple-700 flex items-center">
          <Calendar size={14} className="mr-1" />
          {format(selectedDate || new Date(), "yyyy年MM月dd日 (eee)", { locale: ja })}
          {selectedDate && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
            <span className="ml-1">
              <Image
                src="/images/qyan-transparent.png"
                alt="今日"
                width={20}
                height={20}
                className="inline-block animate-bounce"
              />
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 bg-white rounded-lg shadow-sm p-2 border border-pink-200">
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-yellow-50 border-2 border-yellow-200 p-3 rounded-lg text-center">
          <div className="flex flex-col items-center">
            <Calendar size={24} className="text-yellow-500 mb-1" />
            <p className="text-sm text-yellow-700">
              {selectedDate
                ? `${format(selectedDate, "yyyy年MM月dd日", { locale: ja })}のデータはありません`
                : "日付を選択してください"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-base font-bold text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white py-1 px-2 rounded-full shadow-sm">
            {format(selectedDate, "yyyy年MM月dd日 (eee)", { locale: ja })}の全学年表示
          </h2>

          {sortedData.map((item, index) => {
            // 時限を数値に変換（"1" → 1, "2" → 2, ...）
            const periodNum = Number.parseInt((item.時限 || "").replace(/[^0-9]/g, ""), 10) || 0

            // 1限～4限は昼間部のみ、5限～6限は夜間部のみ表示
            const showDayClasses = periodNum <= 4
            const showNightClasses = periodNum >= 5

            // 時限ごとに異なる背景色を設定
            const bgColors = [
              "from-blue-50 to-cyan-50 border-blue-200",
              "from-green-50 to-teal-50 border-green-200",
              "from-yellow-50 to-amber-50 border-yellow-200",
              "from-orange-50 to-rose-50 border-orange-200",
              "from-pink-50 to-fuchsia-50 border-pink-200",
              "from-purple-50 to-indigo-50 border-purple-200",
            ]
            const colorIndex = (periodNum - 1) % bgColors.length
            const bgColorClass = bgColors[colorIndex]

            return (
              <div key={index} className={`bg-gradient-to-r ${bgColorClass} rounded-lg shadow-sm p-1.5 border`}>
                <h3 className="text-sm font-semibold mb-1 flex items-center justify-center bg-white bg-opacity-70 rounded-full px-2 py-0.5 shadow-sm">
                  <Clock size={14} className="mr-1" />
                  {item.時限}時限 ({item.曜日})
                </h3>

                {/* 時限に応じて表示するクラスを切り替え */}
                <div className="space-y-1">
                  {/* 昼間部（AクラスとBクラス）- 1限～4限のみ表示 */}
                  {showDayClasses && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-0.5 bg-white bg-opacity-50 rounded-full px-2 py-0.5 inline-block">
                        昼間部
                      </h4>
                      <div className="grid grid-cols-6 gap-0.5">
                        {years.map((year) =>
                          dayClasses.map((cls) => (
                            <div key={`${year}${cls}`} className="col-span-1">
                              <div className="text-xs font-medium bg-white bg-opacity-70 px-1 py-0.5 rounded-t-md shadow-sm">
                                {year}年{cls}クラス
                              </div>
                              <ClassContent item={item} year={year} cls={cls} />
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  )}

                  {/* 夜間部（Nクラス）- 5限～6限のみ表示 */}
                  {showNightClasses && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-0.5 bg-white bg-opacity-50 rounded-full px-2 py-0.5 inline-block">
                        夜間部
                      </h4>
                      <div className="grid grid-cols-3 gap-0.5">
                        {years.map((year) =>
                          nightClasses.map((cls) => (
                            <div key={`${year}${cls}`} className="col-span-1">
                              <div className="text-xs font-medium bg-white bg-opacity-70 px-1 py-0.5 rounded-t-md shadow-sm">
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
  )
}

// クラスコンテンツを表示するコンポーネント
function ClassContent({ item, year, cls }) {
  // データフィールドの参照方法
  const content = item[`${year}年${cls}クラスの授業内容`]
  const teacher = item[`${year}年${cls}クラス担当講師名`]
  const periods = item[`${year}年${cls}クラスコマ数`]

  if (!content && !periods) {
    return <div className="bg-white bg-opacity-50 px-1 py-0.5 text-xs text-gray-400 h-10 rounded-b-md">データなし</div>
  }

  const isExam = periods?.includes("試験")
  const isMockExam = periods?.includes("模試")
  const isSelfStudy = content === "マイスタディ" || content === "自宅学習"

  let bgColorClass = "bg-white bg-opacity-70"
  if (isExam) bgColorClass = "bg-red-50"
  else if (isMockExam) bgColorClass = "bg-orange-50"
  else if (isSelfStudy) bgColorClass = "bg-sky-50"

  return (
    <div className={`px-1 py-0.5 h-10 overflow-hidden ${bgColorClass} rounded-b-md shadow-sm`}>
      {content && <p className="text-xs line-clamp-1 leading-tight font-medium">{content}</p>}
      <div className="flex items-center justify-between mt-0.5">
        {teacher && (
          <div className="flex items-center">
            <User size={8} className="text-gray-500 mr-0.5" />
            <p className="text-[10px] text-gray-600 truncate">{teacher}</p>
          </div>
        )}
        {periods && (
          <span
            className={`text-[10px] px-1 py-0.5 rounded-full leading-none ${
              isExam
                ? "bg-red-100 text-red-800"
                : isMockExam
                  ? "bg-orange-100 text-orange-800"
                  : "bg-pink-100 text-pink-800"
            }`}
          >
            {periods}
          </span>
        )}
      </div>
    </div>
  )
}
