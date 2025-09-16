import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "講師ログイン",
}

export default function TeacherLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}