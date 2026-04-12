import Link from "next/link"
import { ArrowRight, CalendarDays, Lock, Sparkles, UserCog } from "lucide-react"

export const metadata = {
  title: "ELTカリキュラムアプリ",
}

export default function Home() {
  const classes = ["A", "B", "N"]
  const years = [1, 2, 3]
  const quickLinks = [
    {
      href: "/daily",
      label: "全学年の日次表示",
      description: "その日の授業を学年横断で確認",
      icon: CalendarDays,
      accent: "from-[#ff8a5b] to-[#ffb36b]",
    },
    {
      href: "/admin/login",
      label: "管理者ログイン",
      description: "データ更新と運用向けメニュー",
      icon: UserCog,
      accent: "from-[#1f5eff] to-[#4ca7ff]",
    },
    {
      href: "/teacher/login",
      label: "講師ログイン",
      description: "担当スケジュールを素早く確認",
      icon: Lock,
      accent: "from-[#0f766e] to-[#49c1b5]",
    },
  ]

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-3 py-5 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid w-full gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <section className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,247,237,0.95))] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8 sm:shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#ffd8c2] blur-3xl sm:h-40 sm:w-40" />
          <div className="absolute bottom-0 left-6 h-20 w-20 rounded-full bg-[#bfdbfe] blur-3xl sm:left-10 sm:h-32 sm:w-32" />
          <div className="relative space-y-4 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd7bf] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a14c1f] shadow-sm sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.24em]">
              <Sparkles size={14} />
              Campus Schedule Hub
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {years.map((year) =>
                classes.map((cls) => (
                  <Link
                    href={`/curriculum?year=${year}&class=${cls}`}
                    key={`${year}${cls}`}
                    className="group rounded-[1rem] border border-slate-200/80 bg-white/90 p-2.5 shadow-[0_10px_20px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-slate-900 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] sm:rounded-[1.4rem] sm:p-4"
                    prefetch={true}
                  >
                    <div className="mb-2 flex items-center justify-between sm:mb-3">
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white sm:px-3 sm:py-1 sm:text-xs">{year}年</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs sm:tracking-[0.24em]">{cls}</span>
                    </div>
                    <p className="text-sm font-bold leading-tight text-slate-900 sm:text-lg">{cls}クラス</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 transition group-hover:text-slate-900 sm:mt-4 sm:gap-2 sm:text-sm">
                      <span className="hidden sm:inline">表を開く</span>
                      <span className="sm:hidden">開く</span>
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                )),
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4">
          {quickLinks.map(({ href, label, description, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group block overflow-hidden rounded-[1.3rem] border border-white/70 bg-white/85 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 sm:rounded-[1.8rem] sm:p-6 sm:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl`}>
                <Icon size={20} className="sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-base font-bold leading-tight text-slate-900 sm:text-xl">{label}</h2>
                <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{description}</p>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition group-hover:text-slate-900 sm:mt-5 sm:text-sm">
                移動する
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}

          <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-[rgba(255,255,255,0.6)] p-4 text-xs leading-6 text-slate-600 sm:rounded-[1.8rem] sm:p-6 sm:text-sm sm:leading-7">
            月表示ではクラス単位で授業の流れを追い、日次表示では全学年の動きを一気に確認できます。
            情報は同じでも、画面ごとに理解の速度が落ちないよう色と余白を統一しています。
          </div>
        </section>
      </div>
    </div>
  )
}
