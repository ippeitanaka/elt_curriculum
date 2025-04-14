"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import CalendarView from "./CalendarView"
import ListView from "./ListView"
import FilterComponent from "./FilterComponent"
import ViewToggle from "./ViewToggle"
import { M_PLUS_Rounded_1c } from "next/font/google"

// データ項目の型定義
interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  [key: string]: any // その他のプロパティ（クラス情報など）
}

// かわいい丸みのあるフォントに変更
const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-mplus-rounded",
})

export default function CurriculumViewer({ initialYear, initialClass, initialData }) {
  const [view, setView] = useState("calendar")
  const [filter, setFilter] = useState({ year: initialYear, class: initialClass })
  const [data, setData] = useState<ScheduleItem[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showExamsOnly, setShowExamsOnly] = useState(false)
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [debugInfo, setDebugInfo] = useState(null)
  const [csvAnalysis, setCsvAnalysis] = useState(null)

  const lastModifiedRef = useRef<string | null>(null)
  const listViewInitializedRef = useRef<boolean>(false)

  // データが null の場合のチェックを追加
  const fetchData = useCallback(async (retryCount = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      }
      if (lastModifiedRef.current) {
        headers["If-Modified-Since"] = lastModifiedRef.current
      }

      const response = await fetch(`/api/curriculum?timestamp=${new Date().getTime()}`, { headers })

      if (response.status === 304) {
        // データが変更されていない場合
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`APIリクエストが失敗しました: ${response.status} ${response.statusText}`)
      }

      const lastModified = response.headers.get("Last-Modified")
      if (lastModified) {
        lastModifiedRef.current = lastModified
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(`APIエラー: ${result.error}`)
      }

      // データが null または undefined の場合は空の配列を設定
      if (!result.data) {
        console.warn("API からのレスポンスにデータがありません")
        setData([])
        return
      }

      setData(result.data)
    } catch (error) {
      console.error("データの取得に失敗しました:", error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))

      // エラー時の再試行（最大3回）
      if (retryCount < 3) {
        setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1))
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      fetchData()
    }

    // 5分ごとにデータを更新
    const intervalId = setInterval(fetchData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [fetchData, initialData])

  // ビュー切り替え時の処理
  useEffect(() => {
    // リスト表示に切り替わったときに、listViewInitializedRefをリセット
    if (view === "list") {
      listViewInitializedRef.current = false
    }
  }, [view])

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>エラーが発生しました: {error}</p>
        <button onClick={fetchData} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          再試行
        </button>
      </div>
    )
  }

  if (isLoading && data.length === 0) {
    return <p className="text-center">データを読み込んでいます...</p>
  }

  if (!data || data.length === 0) {
    return <p className="text-center">データが見つかりません。</p>
  }

  // データを日付と時限でソート
  const sortedData = [...data]
    .filter((item): item is ScheduleItem => item != null && typeof item === "object")
    .sort((a, b) => {
      const dateA = a.日付 ? new Date(a.日付).getTime() : 0
      const dateB = b.日付 ? new Date(b.日付).getTime() : 0
      if (dateA !== dateB) return dateA - dateB
      return (a.時限 || "").localeCompare(b.時限 || "")
    })

  const events = sortedData.filter((item) => {
    const content = item[`${filter.year}年${filter.class}クラスの授業内容`]
    const periods = item[`${filter.year}年${filter.class}クラスコマ数`] || ""
    if (view === "list" && showExamsOnly) {
      return periods.includes("試験") || periods.includes("模試")
    }
    return content || periods
  })

  return (
    <div className={`max-w-6xl mx-auto ${mplusRounded.variable}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <FilterComponent filter={filter} setFilter={setFilter} />
        <div className="flex items-center gap-2">
          {view === "list" && (
            <button
              onClick={() => setShowExamsOnly(!showExamsOnly)}
              className={`px-3 py-1 text-sm ${
                showExamsOnly ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              } rounded-full hover:bg-blue-600`}
            >
              {showExamsOnly ? "全ての日程" : "試験・模試のみ"}
            </button>
          )}
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarView data={events} filter={filter} />
      ) : (
        <ListView data={events} filter={filter} showExamsOnly={showExamsOnly} />
      )}
    </div>
  )
}
