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
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,247,237,0.95))] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#ffd8c2] blur-3xl" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-[#bfdbfe] blur-3xl" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd7bf] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#a14c1f] shadow-sm">
              <Sparkles size={14} />
              Campus Schedule Hub
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {years.map((year) =>
                classes.map((cls) => (
                  <Link
                    href={`/curriculum?year=${year}&class=${cls}`}
                    key={`${year}${cls}`}
                    className="group rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-slate-900 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
                    prefetch={true}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{year}年</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{cls}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{cls}クラス</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition group-hover:text-slate-900">
                      表を開く
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                )),
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {quickLinks.map(({ href, label, description, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group block overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
            >
              <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                <Icon size={24} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{label}</h2>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition group-hover:text-slate-900">
                移動する
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}

          <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-[rgba(255,255,255,0.6)] p-6 text-sm leading-7 text-slate-600">
            月表示ではクラス単位で授業の流れを追い、日次表示では全学年の動きを一気に確認できます。
            情報は同じでも、画面ごとに理解の速度が落ちないよう色と余白を統一しています。
          </div>
        </section>
      </div>
    </div>
  )
}
