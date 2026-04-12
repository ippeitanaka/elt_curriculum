import type React from "react"
import Script from "next/script"
import { BIZ_UDGothic } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, LayoutDashboard } from "lucide-react"
import "./globals.css"

const bizUdGothic = BIZ_UDGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-biz-ud-gothic",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={bizUdGothic.variable}>
      <body className={`min-h-screen font-sans ${bizUdGothic.className}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JPXBRWRFWR"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JPXBRWRFWR');
          `}
        </Script>
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,245,232,0.88)_45%,_rgba(243,247,255,0.92)_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
          <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(255,252,247,0.82)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 text-slate-900">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ELT%E3%83%AD%E3%82%B3%E3%82%99-i0a2k5PekeZ4vFUZcdFJfQnLue6ljN.png"
                  alt="TMCロゴ"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-2xl border border-white/70 bg-white/80 p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                />
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">TMC ELT</p>
                  <p className="text-sm font-bold sm:text-base">救急救命士学科カリキュラム</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:flex">
                <Link
                  href="/daily"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
                >
                  <CalendarDays size={16} />
                  日次ビュー
                </Link>
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
                >
                  <LayoutDashboard size={16} />
                  カリキュラム
                </Link>
              </nav>
            </div>
          </header>
          <main className="relative flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}

export const metadata = {
  title: "ELT カリキュラム",
  generator: 'v0.dev',
  verification: {
    google: 'qObQsnGEBkczrciecDvtAZ7BJlfRxhGicVmM0lVG0eA',
  },
};
