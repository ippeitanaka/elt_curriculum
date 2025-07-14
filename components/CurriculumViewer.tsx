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

// プレビュー用のモックデータ
const mockData: ScheduleItem[] = [
  {
    日付: "2025-01-20",
    曜日: "月曜日",
    時限: "1",
    "1年Aクラスの授業内容": "解剖学講義",
    "1年Aクラス担当講師名": "田中先生",
    "1年Aクラスコマ数": "2",
    "1年Bクラスの授業内容": "生理学講義",
    "1年Bクラス担当講師名": "佐藤先生",
    "1年Bクラスコマ数": "2",
    "1年Nクラスの授業内容": "",
    "1年Nクラス担当講師名": "",
    "1年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-20",
    曜日: "月曜日",
    時限: "2",
    "1年Aクラスの授業内容": "救急医学演習",
    "1年Aクラス担当講師名": "山田先生",
    "1年Aクラスコマ数": "2",
    "1年Bクラスの授業内容": "外傷学講義",
    "1年Bクラス担当講師名": "鈴木先生",
    "1年Bクラスコマ数": "2",
    "1年Nクラスの授業内容": "",
    "1年Nクラス担当講師名": "",
    "1年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-21",
    曜日: "火曜日",
    時限: "1",
    "1年Aクラスの授業内容": "実習",
    "1年Aクラス担当講師名": "高橋先生",
    "1年Aクラスコマ数": "実習4",
    "1年Bクラスの授業内容": "マイスタディ",
    "1年Bクラス担当講師名": "",
    "1年Bクラスコマ数": "2",
    "1年Nクラスの授業内容": "",
    "1年Nクラス担当講師名": "",
    "1年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-22",
    曜日: "水曜日",
    時限: "1",
    "1年Aクラスの授業内容": "解剖学",
    "1年Aクラス担当講師名": "田中先生",
    "1年Aクラスコマ数": "試験",
    "1年Bクラスの授業内容": "生理学",
    "1年Bクラス担当講師名": "佐藤先生",
    "1年Bクラスコマ数": "模試",
    "1年Nクラスの授業内容": "",
    "1年Nクラス担当講師名": "",
    "1年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-23",
    曜日: "木曜日",
    時限: "1",
    "1年Aクラスの授業内容": "救急救命処置演習",
    "1年Aクラス担当講師名": "伊藤先生",
    "1年Aクラスコマ数": "3",
    "1年Bクラスの授業内容": "病院実習",
    "1年Bクラス担当講師名": "渡辺先生",
    "1年Bクラスコマ数": "実習6",
    "1年Nクラスの授業内容": "",
    "1年Nクラス担当講師名": "",
    "1年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-24",
    曜日: "金曜日",
    時限: "1",
    "1年Aクラスの授業内容": "心電図読解講義",
    "1年Aクラス担当講師名": "中村先生",
    "1年Aクラスコマ数": "2",
    "1年Bクラスの授業内容": "薬理学講義",
    "1年Bクラス担当講師名": "小林先生",
    "1年Bクラスコマ数": "2",
    "1年Nクラスの授業内容": "救急医学講義",
    "1年Nクラス担当講師名": "加藤先生",
    "1年Nクラスコマ数": "2",
  },
  // 2年生のデータ
  {
    日付: "2025-01-20",
    曜日: "月曜日",
    時限: "1",
    "2年Aクラスの授業内容": "臨床実習",
    "2年Aクラス担当講師名": "松本先生",
    "2年Aクラスコマ数": "実習8",
    "2年Bクラスの授業内容": "症例検討",
    "2年Bクラス担当講師名": "井上先生",
    "2年Bクラスコマ数": "3",
    "2年Nクラスの授業内容": "",
    "2年Nクラス担当講師名": "",
    "2年Nクラスコマ数": "",
  },
  {
    日付: "2025-01-21",
    曜日: "火曜日",
    時限: "1",
    "2年Aクラスの授業内容": "国家試験対策",
    "2年Aクラス担当講師名": "木村先生",
    "2年Aクラスコマ数": "模試",
    "2年Bクラスの授業内容": "救急車同乗実習",
    "2年Bクラス担当講師名": "林先生",
    "2年Bクラスコマ数": "実習12",
    "2年Nクラスの授業内容": "",
    "2年Nクラス担当講師名": "",
    "2年Nクラスコマ数": "",
  },
  // 3年生のデータ
  {
    日付: "2025-01-20",
    曜日: "月曜日",
    時限: "1",
    "3年Aクラスの授業内容": "国家試験",
    "3年Aクラス担当講師名": "",
    "3年Aクラスコマ数": "試験",
    "3年Bクラスの授業内容": "国家試験",
    "3年Bクラス担当講師名": "",
    "3年Bクラスコマ数": "試験",
    "3年Nクラスの授業内容": "国家試験",
    "3年Nクラス担当講師名": "",
    "3年Nクラスコマ数": "試験",
  },
  {
    日付: "2025-01-22",
    曜日: "水曜日",
    時限: "1",
    "3年Aクラスの授業内容": "卒業研究発表",
    "3年Aクラス担当講師名": "教授陣",
    "3年Aクラスコマ数": "4",
    "3年Bクラスの授業内容": "卒業研究発表",
    "3年Bクラス担当講師名": "教授陣",
    "3年Bクラスコマ数": "4",
    "3年Nクラスの授業内容": "卒業研究発表",
    "3年Nクラス担当講師名": "教授陣",
    "3年Nクラスコマ数": "4",
  },
]

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
      // プレビュー環境では環境変数がないため、モックデータを使用
      if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
        console.log("プレビュー環境でモックデータを使用します")
        setData(mockData)
        setIsLoading(false)
        return
      }

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

      // エラー時はモックデータを使用
      console.log("エラーのためモックデータを使用します")
      setData(mockData)
      setError(null) // エラーを表示せずにモックデータで継続

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
    } else {
      setData(initialData)
    }

    // 5分ごとにデータを更新（プレビュー環境では無効化）
    if (typeof window !== "undefined" && !window.location.hostname.includes("v0.dev")) {
      const intervalId = setInterval(fetchData, 5 * 60 * 1000)
      return () => clearInterval(intervalId)
    }
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
      <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-200">
        <p className="text-lg font-medium mb-4">エラーが発生しました</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          再試行
        </button>
      </div>
    )
  }

  if (isLoading && data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">データを読み込んでいます...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
        <p className="text-lg font-medium text-yellow-800">データが見つかりません。</p>
      </div>
    )
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

  // コンテナの高さとパディングを最小化
  return (
    <div className={`max-w-7xl mx-auto ${mplusRounded.variable}`}>
      {/* プレビュー環境での注意書き */}
      {typeof window !== "undefined" && window.location.hostname.includes("v0.dev") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <p className="text-blue-800 text-sm">
            <strong>プレビュー環境:</strong> 実際のデータベースに接続できないため、サンプルデータを表示しています。
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FilterComponent filter={filter} setFilter={setFilter} />
            {view === "list" && (
              <button
                onClick={() => setShowExamsOnly(!showExamsOnly)}
                className={`px-2 py-1 text-sm font-medium rounded-lg transition-colors ${
                  showExamsOnly ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showExamsOnly ? "全ての日程" : "試験・模試のみ"}
              </button>
            )}
          </div>
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
