import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import CurriculumViewer from "../../components/CurriculumViewer"
import Loading from "./loading"

export const dynamic = "force-dynamic"

async function fetchAllData(supabase) {
  let allData = []
  let hasMore = true
  let start = 0
  const pageSize = 1000

  while (hasMore) {
    const { data, error } = await supabase
      .from("スケジュール")
      .select("*")
      .order("日付", { ascending: true })
      .order("時限", { ascending: true })
      .range(start, start + pageSize - 1)

    if (error) {
      console.error("Error fetching data:", error)
      throw error
    }

    if (data.length > 0) {
      allData = [...allData, ...data]
      start += pageSize
      console.log(`${start}行目までのデータを取得しました`)
    }

    // データが pageSize より少なければ、すべてのデータを取得完了
    hasMore = data.length === pageSize
  }

  console.log(`合計 ${allData.length} 行のデータを取得しました`)
  return allData
}

export default async function Page({ searchParams }) {
  const year = searchParams.year || "1"
  const classParam = searchParams.class || "A"

  // プレビュー環境では Supabase 接続をスキップ
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    try {
      const supabase = createServerComponentClient({ cookies })
      console.log("データ取得を開始します")
      const curriculumData = await fetchAllData(supabase)

      if (!curriculumData || curriculumData.length === 0) {
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">
              {year}年{classParam}クラス カリキュラム
            </h1>
            <Suspense fallback={<Loading />}>
              <CurriculumViewer initialYear={year} initialClass={classParam} initialData={[]} />
            </Suspense>
          </div>
        )
      }

      // データの範囲を確認
      const firstDate = curriculumData[0].日付
      const lastDate = curriculumData[curriculumData.length - 1].日付
      console.log(`データ範囲: ${firstDate} から ${lastDate}`)

      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">
            {year}年{classParam}クラス カリキュラム
          </h1>
          {/* デバッグ情報の表示（開発時のみ） */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-sm text-gray-500 mb-4">
              <p>取得データ数: {curriculumData.length}行</p>
              <p>
                データ範囲: {firstDate} 〜 {lastDate}
              </p>
            </div>
          )}
          <Suspense fallback={<Loading />}>
            <CurriculumViewer initialYear={year} initialClass={classParam} initialData={curriculumData} />
          </Suspense>
        </div>
      )
    } catch (error) {
      console.error("Error:", error)
      // エラー時はモックデータで表示
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">
            {year}年{classParam}クラス カリキュラム
          </h1>
          <Suspense fallback={<Loading />}>
            <CurriculumViewer initialYear={year} initialClass={classParam} initialData={[]} />
          </Suspense>
        </div>
      )
    }
  }

  // プレビュー環境では直接コンポーネントを表示
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {year}年{classParam}クラス カリキュラム
      </h1>
      <Suspense fallback={<Loading />}>
        <CurriculumViewer initialYear={year} initialClass={classParam} initialData={[]} />
      </Suspense>
    </div>
  )
}
