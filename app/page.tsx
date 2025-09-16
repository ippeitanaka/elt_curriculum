import Link from "next/link"
export const metadata = {
  title: "ELTカリキュラムアプリ",
}

export default function Home() {
  const classes = ["A", "B", "N"]
  const years = [1, 2, 3]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-gray-900">カリキュラムビューアー</h2>
                <p>学年とクラスを選択してください</p>
                <div className="grid grid-cols-3 gap-4">
                  {years.map((year) =>
                    classes.map((cls) => (
                      <Link
                        href={`/curriculum?year=${year}&class=${cls}`}
                        key={`${year}${cls}`}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        prefetch={true}
                      >
                        {year}年{cls}クラス
                      </Link>
                    )),
                  )}
                </div>
                <div className="mt-8 space-y-4">
                  <Link
                    href="/daily"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    全学年表示
                  </Link>
                  <Link
                    href="/admin/login"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    管理者ログイン
                  </Link>
                  <Link
                    href="/teacher/login"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    講師ログイン
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
