import type React from "react"
import { M_PLUS_Rounded_1c } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"

// かわいい丸みのあるフォントに変更
const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: true,
  variable: "--font-mplus-rounded",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={mplusRounded.variable}>
      <body className={`min-h-screen bg-white font-sans ${mplusRounded.className}`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 bg-black text-white h-12 sm:h-16 flex items-start">
            <div className="container mx-auto flex h-full items-center px-4 pt-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ELT%E3%83%AD%E3%82%B3%E3%82%99-i0a2k5PekeZ4vFUZcdFJfQnLue6ljN.png"
                  alt="TMCロゴ"
                  width={40}
                  height={40}
                  className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg"
                />
                <span className="text-xs sm:text-sm font-bold">救急救命士学科</span>
              </Link>
            </div>
          </header>
          <main className="flex-1 bg-white">{children}</main>
        </div>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.dev',
  verification: {
    google: 'qObQsnGEBkczrciecDvtAZ7BJlfRxhGicVmM0lVG0eA',
  },
};
