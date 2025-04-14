/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
    appDir: true,
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
