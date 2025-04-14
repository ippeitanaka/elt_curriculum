"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import ListView from "../../../components/ListView"

export default function TeacherSchedule() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInstructor, setSelectedInstructor] = useState("全て")
  const router = useRouter()
  const lastModifiedRef = useRef<string | null>(null)
  const [debugInfo, setDebugInfo] = useState(null) // デバッグ情報を追加
  const [noDataMessage, setNoDataMessage] = useState("")

  const fetchData = useCallback(
    async (retryCount = 0) => {
      try {
        setIsLoading(true)
        setError(null)
        setNoDataMessage("")

        // ローカルストレージのチェック
        const isTeacher = localStorage.getItem("isTeacher")
        if (!isTeacher) {
          router.push("/teacher/login")
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

        console.log("データ取得を開始します...")
        const response = await fetch(`/api/curriculum?timestamp=${new Date().getTime()}`, { headers })

        if (response.status === 304) {
          // データが変更されていない場合
          setIsLoading(false)
          return
        }

        // レスポンスのステータスコードをデバッグ情報に追加
        setDebugInfo((prev) => ({ ...prev, status: response.status }))

        // 404エラーを特別に処理
        if (response.status === 404) {
          setNoDataMessage("データが見つかりません。管理者にお問い合わせください。")
          setData([])
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(`データの取得に失敗しました: ステータスコード ${response.status}`)
        }

        const lastModified = response.headers.get("Last-Modified")
        if (lastModified) {
          lastModifiedRef.current = lastModified
        }

        const result = await response.json()

        // レスポンスの内容をデバッグ情報に追加
        setDebugInfo((prev) => ({
          ...prev,
          hasData: !!result.data,
          dataLength: result.data ? result.data.length : 0,
          message: result.message || null,
        }))

        // メッセージがある場合は表示
        if (result.message) {
          setNoDataMessage(result.message)
        }

        // データが null または undefined の場合は空の配列を設定
        if (!result.data) {
          console.warn("API からのレスポンスにデータがありません")
          setData([])
        } else if (result.data.length === 0) {
          setNoDataMessage("表示するデータがありません。")
          setData([])
        } else {
          setData(result.data)
          console.log(`${result.data.length}件のデータを取得しました`)
        }
      } catch (error) {
        console.error("データ取得エラー:", error)
        setError(error instanceof Error ? error.message : "データの取得中にエラーが発生しました")

        // エラー時の再試行（最大3回）
        if (retryCount < 3) {
          console.log(`${retryCount + 1}回目の再試行を開始します...`)
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  useEffect(() => {
    // コンポーネントマウント時にローカルストレージをチェック
    const isTeacher = localStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }

    fetchData()

    // 5分ごとにデータを更新
    const intervalId = setInterval(fetchData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [router, fetchData])

  const instructors = useMemo(() => {
    if (!data || data.length === 0) return ["全て"]

    const instructorSet = new Set()
    data.forEach((item) => {
      if (!item) return // null チェック

      for (let i = 1; i <= 3; i++) {
        for (const cls of ["A", "B", "N"]) {
          const instructor = item[`${i}年${cls}クラス担当講師名`]
          if (instructor && instructor !== "試験" && instructor !== "自宅学習") {
            instructorSet.add(instructor)
          }
        }
      }
    })
    return ["全て", ...Array.from(instructorSet).sort()]
  }, [data])

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    if (selectedInstructor === "全て") return data

    return data
      .filter((item) => item) // null チェック
      .flatMap((item) => {
        const filteredClasses = []
        for (let i = 1; i <= 3; i++) {
          for (const cls of ["A", "B", "N"]) {
            if (item[`${i}年${cls}クラス担当講師名`] === selectedInstructor) {
              filteredClasses.push({
                ...item,
                filteredYear: i,
                filteredClass: cls,
              })
            }
          }
        }
        return filteredClasses
      })
      .filter((item) => item.filteredYear !== undefined)
  }, [data, selectedInstructor])

  // ローディング中の表示を改善
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // エラー表示を改善
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {debugInfo && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">詳細情報</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchData()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  再試行
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // データがない場合の表示
  if (noDataMessage || !data || data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">講師用スケジュール</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">お知らせ</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{noDataMessage || "表示するデータがありません。管理者にお問い合わせください。"}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchData()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  再読み込み
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">講師用スケジュール</h1>
      <div className="mb-4">
        <label htmlFor="instructor-filter" className="block text-sm font-medium text-gray-700 mb-2">
          担当講師名でフィルタリング
        </label>
        <select
          id="instructor-filter"
          value={selectedInstructor}
          onChange={(e) => setSelectedInstructor(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {instructors.map((instructor) => (
            <option key={instructor} value={instructor}>
              {instructor}
            </option>
          ))}
        </select>
      </div>
      <ListView data={filteredData} filter={{ year: "1", class: "A" }} selectedInstructor={selectedInstructor} />
    </div>
  )
}
