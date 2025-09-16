import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DataUploader from "../../components/DataUploader"

export const metadata = {
  title: "管理者ページ",
}

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // データベースの状態を確認
  const { data: scheduleData, error: scheduleError } = await supabase
    .from("スケジュール")
    .select("日付")
    .order("日付", { ascending: false })
    .limit(1)

  const latestDate = scheduleData && scheduleData.length > 0 ? scheduleData[0].日付 : "データなし"

  // 総データ件数を確認
  const { count: totalCount } = await supabase.from("スケジュール").select("*", { count: "exact", head: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">管理者ページ</h1>
      <p className="mb-4">ようこそ、{session.user.email}様。ここでカリキュラムの管理を行うことができます。</p>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">データベース状態</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">最新データ日付</p>
            <p className="text-lg font-medium">{latestDate}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">総データ件数</p>
            <p className="text-lg font-medium">{totalCount !== null ? `${totalCount}件` : "取得中..."}</p>
          </div>
        </div>
      </div>

      <DataUploader />
    </div>
  )
}
