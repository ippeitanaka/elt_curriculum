/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["hebbkx1anhila5yf.public.blob.vercel-storage.com", "usgpuiszdtzmxeujuxfb.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    // 他に experimental オプションが必要ならここへ記載
  },
  // TypeScriptのビルドエラーを無視する設定を追加
  typescript: {
    // !! 警告 !!
    // プロジェクトに型エラーがあっても、本番ビルドを成功させることを許可します
    // !! 警告 !!
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
