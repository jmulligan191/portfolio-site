import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { SentryProvider } from "@/components/sentry-provider"
import { NavHeader } from "@/components/nav-header"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

const cloudflareToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
const cloudflareBeaconUrl = process.env.NEXT_PUBLIC_CF_BEACON_URL
const enableCloudflare = process.env.NEXT_PUBLIC_ENABLE_CF_ANALYTICS === "true"
const isProduction = process.env.NODE_ENV === "production"

export const metadata: Metadata = {
  title: {
    default: "John Mulligan | Software Engineering Student",
    template: "%s | John Mulligan",
  },
  description:
    "Portfolio of John Mulligan, a first-year Software Engineering student at Rochester Institute of Technology.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {isProduction && enableCloudflare && cloudflareToken && cloudflareBeaconUrl && (
          <Script
            src={cloudflareBeaconUrl}
            data-cf-beacon={`{"token":"${cloudflareToken}"}`}
            strategy="afterInteractive"
          />
        )}
        <SentryProvider>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-svh flex-col">
                <NavHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </Providers>
        </SentryProvider>
      </body>
    </html>
  )
}
